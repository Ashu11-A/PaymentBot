import { config } from "@/app"
import { App } from "./app"
import dotenv from "dotenv"
dotenv.config()
export default function Run() {
  new App().server.listen(config.Express.Port, () => {
    console.log(`Servidor listado em http://localhost:${config.Express.Port}`)
  })
}
