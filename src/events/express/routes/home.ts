import { type Request, type Response } from 'express'
import { core } from '@/app'

class Home {
  /**
     * Home Page
     */
  public get (req: Request, res: Response): object {
    const ipAddress: any = req.headers['x-forwarded-for'] ?? req.socket.remoteAddress
    try {
      return res.json({
        status: 200,
        your_ip: ipAddress,
        router: req.originalUrl
      })
    } catch {
      return res.json({
        status: 500,
        your_ip: ipAddress,
        router: req.originalUrl
      })
    } finally {
      core.info(`Alguem acessou o router: ${req.originalUrl} no ip ${ipAddress}`.yellow)
    }
  }
}

export const Root = new Home()
