import { type Request, type Response } from 'express'

class Home {
  /**
    * Home Page
    */
  public get (req: Request, res: Response): object {
    const ipAddress = req.headers['x-forwarded-for'] ?? req.socket.remoteAddress
    try {
      return res.json({
        status: 200,
        yourIp: ipAddress,
        router: req.originalUrl
      }).status(200)
    } catch {
      return res.json({
        status: 500,
        your_ip: ipAddress,
        router: req.originalUrl
      }).status(500)
    }
  }
}

export const Root = new Home()
