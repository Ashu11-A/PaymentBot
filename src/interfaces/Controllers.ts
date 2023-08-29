/**
 * Interface controllers/loggings/params
 */

export interface LogType {
  level: number
  color: string
}

export type Loggings = Record<string, LogType>

/**
 * Interface controllers/loggings/logs
 */

export interface ConsoleLog {
  currentHour: string
  color: string
  controller: string
  levelColor: string
  level: string
  message: string
}
