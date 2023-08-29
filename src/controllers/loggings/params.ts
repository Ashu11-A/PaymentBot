export interface LogType {
  level: number
  color: string
}

export type Loggings = Record<string, LogType>

export const loggings: Loggings = {
  Error: {
    level: 0,
    color: 'red'
  },
  Core: {
    level: 0,
    color: 'green'
  },
  Warn: {
    level: 1,
    color: 'yellow'
  },
  Info: {
    level: 2,
    color: 'cyan'
  },
  Debug: {
    level: 3,
    color: 'magenta'
  },
  Alternative: {
    level: 0,
    color: 'white'
  }
}
