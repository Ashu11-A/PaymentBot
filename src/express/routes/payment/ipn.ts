/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { type Request, type Response } from 'express'
import { core, db } from '@/app'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { type infoPayment } from '@/discord/components/payments'

class IPN {
  /**
    * Recebe os POST do Mercado Pago, confirmando o pagamento.
    */
  public async post (req: Request, res: Response): Promise<object> {
    const ipAddress = req.headers['x-forwarded-for'] ?? req.socket.remoteAddress
    core.info(`Acesso ao IPN | Método POST | IP: ${ipAddress}`)
    const { live_mode: liveMode, data } = req.body

    if (liveMode === true) {
      try {
        if (data?.id !== undefined) {
          const { userId, guildId, channelId, UUID, userName } = req.body.metadata as infoPayment
          const cartData = await db.payments.get(`${guildId}.process.${channelId}`)

          if (cartData?.UUID === UUID) {
            const token = await db.payments.get(`${guildId}.config.mcToken`)
            const client = new MercadoPagoConfig({ accessToken: token })
            const status = await new Payment(client).get(data.id)

            await db.payments.set(`${guildId}.process.${channelId}.ipn`, {
              description: status.description,
              email: status?.payer?.email,
              ip: status?.additional_info?.ip_address,
              currency: status?.currency_id,
              payment_method_id: status?.payment_method?.id
            })
            await db.payments.set(`${guildId}.process.${channelId}.paymentId`, data.id)

            core.info(`Pagamento ${data.id}, foi aprovado.\nUser: ${userName}\nId: ${userId}`)
            return res.status(200).json({
              status: 'success'
            })
          } else {
            core.warn(`Tentativa de fraude!.\nUser: ${userId}\nUUID (Local): ${cartData.UUID}\nUUID (Externo): ${UUID}`)
            return res.status(403).json({
              status: 'refused'
            })
          }
        } else {
          core.info('IPN: codigo não encontrado, possivel fraude.')
          return res.status(401)
        }
      } catch (err) {
        core.error(err)
        return res.status(500)
      }
    } else {
      return res.status(200)
    }
  }
}

export const Root = new IPN()
