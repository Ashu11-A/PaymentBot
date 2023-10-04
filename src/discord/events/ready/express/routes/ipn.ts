import { type Request, type Response } from 'express'
import { core, db } from '@/app'
import mp from 'mercadopago'

class IPN {
  /**
    * Recebe os POST do Mercado Pago, confirmando o pagamento.
    */
  public async post (req: Request, res: Response): Promise<object> {
    const ipAddress: any = req.headers['x-forwarded-for'] ?? req.socket.remoteAddress
    core.info(`Acesso ao IPN | Método POST | IP: ${ipAddress}`)
    const { live_mode: liveMode, data } = req.body

    if (liveMode === true) {
      try {
        if (data?.id !== undefined) {
          const { userId, guildId, messageId, UUID } = req.body.metadata
          const cardData = await db.payments.get(`${guildId}.process.${messageId}`)

          if (cardData?.UUID === UUID) {
            const token = await db.payments.get(`${guildId}.config.mcToken`)
            mp.configure({
              access_token: token
            })

            const status = await mp.payment.get(data.id)
            console.log(status)
            await db.payments.set(`${guildId}.process.${messageId}.ipn`, {
              description: status.body.description,
              email: status.body.payer.email,
              ip: status.body.additional_info.ip_address,
              currency: status.body.currency_id,
              payment_method_id: status.body.payment_method.id,
              paymentID: data.id
            })

            core.info(`Pagamento ${data.id}, foi aprovado.\nUser: ${userId}`)
            return res.status(200).json({
              status: 'success'
            })
          } else {
            core.warn(`Tentativa de fraude!.\nUser: ${userId}\nUUID (Local): ${cardData.UUID}\nUUID (Externo): ${UUID}`)
            return res.status(403).json({
              status: 'refused'
            })
          }
        } else {
          core.info('IPN: codigo não encontrado, possivel fraude.')
          return res.status(401)
        }
      } catch (err: any) {
        core.error(err)
        return res.status(500)
      }
    } else {
      return res.status(200)
    }
  }
}

export const Root = new IPN()
