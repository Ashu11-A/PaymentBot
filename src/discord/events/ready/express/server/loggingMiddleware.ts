import { core } from '@/app'
import { type Request, type Response, type NextFunction } from 'express'

export function loggingMiddleware (req: Request, res: Response, next: NextFunction): void {
  const ipAddress: string | string[] | undefined = req.headers['x-forwarded-for'] ?? req.socket.remoteAddress

  // Registre o IP e a rota no console
  if (ipAddress !== undefined) {
    core.info(`Acesso à rota: ${req.originalUrl} - IP: ${ipAddress.toString()}`.yellow)
  }

  next()
}
