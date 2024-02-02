import { logs } from '@/controllers/loggings/logs'

class Loggings {
  private readonly title: string
  private readonly color: string

  constructor (title: string, color: string) {
    this.title = title ?? 'Core'
    this.color = color ?? 'blue'
  }

  error (message: any): void {
    logs(this.title, message, 'Error', this.color)
  }

  warn (message: string): void {
    logs(this.title, message, 'Warn', this.color)
  }

  info (message: string): void {
    logs(this.title, message, 'Info', this.color)
  }

  debug (message: string): void {
    logs(this.title, message, 'Debug', this.color)
  }
}

/**
 * #### Type LoggingsConstructor
 *
 * ```ts
 * import Loggings { LoggingsConstructor } from "@/controllers/Loggings"
 *
 * const core:LoggingsConstructor = new Loggings("Exemplo", "blue")
 * ```
 */
export type LoggingsConstructor = new (title: string, color: string) => Loggings

/**
 * #### Type LoggingsMethods
 *
 * ```ts
 * import {LoggingsMethods} from "@/controllers/Loggings"
 * function Core(core: LoggingsMethods) {
 * core.log("Olá")
 * }
 * ```
 */
export interface LoggingsMethods {
  log: (message: string) => void
  error: (message: string) => void
  warn: (message: string) => void
  info: (message: string) => void
  debug: (message: string) => void
  sys: (message: string) => void
}
export default Loggings
