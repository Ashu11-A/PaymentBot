import express from 'express'
import { router } from './router'

export class App {
  listen(Port: number, arg1: () => void) {
    throw new Error('Method not implemented.')
  }
  public server: express.Application

  constructor () {
    this.server = express()
    this.middleware()
    this.router()
  }

  private middleware (): void {
    this.server.use(express.json())
  }

  private router (): void {
    this.server.use(router)
  }
}
