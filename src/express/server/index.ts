import { core } from '@/app'
import { settings } from '@/settings'
import { App } from './app'
import http from 'http'
import dotenv from 'dotenv'
dotenv.config()

export default function Run (): void {
  const app = new App().server
  const server = http.createServer(app)

  server.listen(settings.Express.Port, settings.Express.ip, () => {
    core.info(`✅ Servidor listado em http://localhost:${settings.Express.Port}`.green)
  })
}
