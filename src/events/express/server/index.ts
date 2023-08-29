import { config, core } from '@/app'
import { App } from './app'
import dotenv from 'dotenv'
dotenv.config()
export default function Run (): void {
  new App().server.listen(config.Express.Port, () => {
    core.info(`✅ Servidor listado em http://localhost:${config.Express.Port}`.green)
  })
}
