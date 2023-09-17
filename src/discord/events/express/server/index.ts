import { core } from '@/app'
import { settings } from '@/settings'
import { App } from './app'
import dotenv from 'dotenv'
dotenv.config()
export default function Run (): void {
  new App().server.listen(settings.Express.Port, () => {
    core.info(`✅ Servidor listado em http://localhost:${settings.Express.Port}`.green)
  })
}
