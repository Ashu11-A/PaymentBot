import { core } from '@/app'
import { type Request, type Response, type NextFunction } from 'express'
import { settings } from '@/settings'
import cors from 'cors'

export function corsMiddleware (req: Request, res: Response, next: NextFunction): void {
  const { active } = settings.Express.cors
  let { allow } = settings.Express.cors

  if (active) {
    cors<Request>({
      origin (requestOrigin, callback) {
        if (allow === undefined) allow = ['']
        allow.push(`${settings.Express.ip}:${settings.Express.Port}`)

        const origin = requestOrigin ?? req.headers.ip ?? req.headers['x-forwarded-for'] ?? req.socket.remoteAddress ?? req.ip

        if (typeof origin === 'string' && (Boolean(allow.includes(origin)))) {
          callback(null, true)
        } else if (Array.isArray(origin)) {
          let found = false

          for (const originItem of origin) {
            if (typeof originItem === 'string' && (Boolean(allow.includes(originItem)))) {
              callback(null, true)
              found = true
              return
            }
          }

          if (!found) {
            callback(new Error('Acesso não autorizado devido à política CORS.'), false)
          }
        } else {
          callback(new Error('Acesso não autorizado devido à política CORS.'), false)
        }
      },
      optionsSuccessStatus: 200,
      credentials: true
    })(req, res, (err) => {
      const ipAddress: string | string[] | undefined = req.headers['x-forwarded-for'] ?? req.socket.remoteAddress

      if (err !== undefined) {
        core.warn(`Bloqueado: ${req.originalUrl} - IP: ${ipAddress?.toString()}`.red)
        return res.status(403).json({ status: 403, message: 'Operação não permitida' })
      } else {
        next()
      }
    })
  } else {
    next()
  }
}

export function fuckFavicon (req: Request, res: Response, next: NextFunction): void {
  if (req.originalUrl === '/favicon.ico') {
    res.writeHead(200, { 'Content-Type': 'image/x-icon' })
    res.end()
  } else {
    next()
  }
}

export function loggingMiddleware (req: Request, res: Response, next: NextFunction): void {
  const ipAddress: string | string[] | undefined = req.headers['x-forwarded-for'] ?? req.socket.remoteAddress

  // Registre o IP e a rota no console
  if (ipAddress !== undefined) {
    core.info(`Acesso à rota: ${req.originalUrl} - IP: ${ipAddress.toString()}`.yellow)
  }

  next()
}
