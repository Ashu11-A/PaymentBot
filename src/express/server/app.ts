import express from 'express'
import { router } from './router'
import helmet from 'helmet'
import bodyParser from 'body-parser'

export class App {
  public server: express.Application

  constructor () {
    this.server = express()
    this.middleware()
    this.router()
  }

  private middleware (): void {
    this.server.use(helmet())
    this.server.use(express.json())
    this.server.use(bodyParser.json())
    this.server.use(bodyParser.urlencoded({ extended: true }))
  }

  private router (): void {
    this.server.use(helmet())
    this.server.use(express.json())
    this.server.use(bodyParser.json())
    this.server.use(bodyParser.urlencoded({ extended: true }))
    this.server.use(router)
  }
}
