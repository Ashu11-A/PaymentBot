import { client, db } from '@/app'
import { numerosParaLetras } from '@/functions'
import { type Request, type Response } from 'express'

export class CtrlPanel {
  /**
     * Mostra o total de usuários atuais registrados no dash
     */
  public async get (req: Request, res: Response): Promise<Response<any, Record<string, any>>> {
    try {
      const guilds = client.guilds.cache
      const dataCtrlPanel: Record<string, any> = {}

      for (const guild of guilds.values()) {
        const { id } = guild
        const ctrlUsers = await db.ctrlPanel.table(`${numerosParaLetras(id)}_users`).get('metadata')
        const ctrlServer = await db.ctrlPanel.table(`${numerosParaLetras(id)}_servers`).get('metadata')

        dataCtrlPanel[id] = {
          ...ctrlUsers,
          ...ctrlServer
        }
      }

      if (dataCtrlPanel !== undefined) {
        return res.status(200).json({
          status: 200,
          ...dataCtrlPanel
        })
      } else {
        return res.status(404).json({
          status: 404,
          message: 'Nenhuma informação foi encontrada'
        })
      }
    } catch (error) {
      return res.status(500).json({
        status: 500,
        error: 'Internal Server Error'
      })
    }
  }
}
export const Root = new CtrlPanel()
