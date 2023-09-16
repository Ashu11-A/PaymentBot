import { logs } from '@/controllers/loggings/logs'

class Loggings {
  private readonly title: string
  private readonly color: string

  constructor (title: string, color: string) {
    this.title = title ?? 'Core'
    this.color = color ?? 'blue'
  }

  error (message: string): void {
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

export default Loggings
