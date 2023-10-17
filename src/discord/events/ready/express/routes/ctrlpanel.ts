import { db } from '@/app'
import { numerosParaLetras } from '@/functions'
import { type Request, type Response } from 'express'

export class CtrlPanel {
  /**
     * Mostra o total de usuários atuais registrados no dash
     */
  public async get (req: Request, res: Response): Promise<Response<any, Record<string, any>>> {
    try {
      const guildId = req.query.guildId as string | undefined

      if (guildId === undefined) {
        return res.status(400).json({
          status: 400,
          error: 'Missing or invalid parameter'
        })
      }

      const ctrlUsers = await db.ctrlPanel.table(`${numerosParaLetras(guildId)}_users`).get('metadata')
      const ctrlServer = await db.ctrlPanel.table(`${numerosParaLetras(guildId)}_servers`).get('metadata')
      return res.status(200).json({
        status: 200,
        users: {
          ...ctrlUsers
        },
        servers: {
          ...ctrlServer
        }
      })
    } catch (error) {
      return res.status(500).json({
        status: 500,
        error: 'Internal Server Error'
      })
    }
  }
}
export const Root = new CtrlPanel()
