import { db } from '@/app'
import { type Request, type Response } from 'express'

class Database {
  /**
   * Rota para acessar dados de uma tabela específica.
   */
  public async get (req: Request, res: Response): Promise<any> {
    const tableName = req.query.tableName as string | undefined

    if (tableName === undefined) {
      return res.status(400).json({
        status: 400,
        error: 'Missing or invalid tableName parameter'
      })
    }

    try {
      if (tableName in db) {
        const tableData = await db[tableName].all()
        return res.json(tableData)
      } else {
        return res.status(404).json({
          status: 404,
          error: 'Table not found'
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

export const Root = new Database()
