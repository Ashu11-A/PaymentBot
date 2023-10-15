import { core, db } from '@/app'
import { ctrlPanel } from '@/functions/ctrlPanel'
import { type Request, type Response } from 'express'

export interface RequestBodyCtrlPanelVoucher {
  token: string
  user: { id: string, name: string }
  guild: { id: string, name: string }
  productId: string
  credits: number
  price: number
  name: string
}

class CreateVoucher {
  /**
    * Recebe solicitações para a criação de vouchers
    */
  public async post (req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined> {
    const token = await db.tokens.get('token')
    const { token: tokenAuth, user, guild, credits, productId, price, name } = req.body as RequestBodyCtrlPanelVoucher
    const ipAddress = req.headers['x-forwarded-for'] ?? req.socket.remoteAddress
    console.log(req.body)

    if (tokenAuth === token) {
      console.log('Webhook URL is valid')

      if (
        typeof tokenAuth !== 'string' ||
        typeof user !== 'object' ||
        typeof guild !== 'object' ||
        typeof productId !== 'number' ||
        typeof credits !== 'number' ||
        typeof price !== 'number' ||
        typeof name !== 'string'
      ) {
        console.log('Missing required fields')
        return res.json({
          error: 'Bad Request: Missing required fields',
          status: 400
        })
      }

      try {
        const [code, id] = await ctrlPanel.createVoucher({ dataCtrlPanelVoucher: req.body as RequestBodyCtrlPanelVoucher })
        if (code !== undefined || id !== undefined) {
          console.log(
            'Usuário' + user.name,
            '\nVoucher: ' + code,
            '\nCréditos: ' + credits,
            '\nPreço: ' + price
          )
          return res.status(200).send({
            code,
            id
          })
        } else {
          return res.json({
            error: 'A função createVoucher não retornou corretamente o code e id',
            status: 500
          })
        }
      } catch (err) {
        console.log(err)
      }
    } else {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      core.warn(`Alguem acessou a URL do Webhook sem token! IP: ${ipAddress}`)
      return res.status(401).send('Invalid webhook URL')
    }
  }
}

export const Root = new CreateVoucher()
