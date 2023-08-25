import { json } from 'utils/Json'
import { getTimestamp } from 'controllers/loggings/getTimestamp'
import { loggings } from 'controllers/loggings/params'
import colors from 'colors'
import { registerlog } from 'controllers/loggings/registerlog'
import { type ConsoleLog as ConsoleLogger } from 'interfaces/Controllers'
import { config } from '@/app'

export function logs (controller: string, message: string, level: string, color: string): void {
  const valoressssss = json(config.Logs.configPATH + '/loggings.json')
  const CURRENT_LOG_LEVEL = valoressssss.level ?? 'Debug' // Altere o nível atual conforme necessário

  // Use LogType para tipar levelConfig
  const levelConfig: any = loggings[level] ?? loggings.Alternative
  const currentLevelConfig = loggings[CURRENT_LOG_LEVEL]

  if (level === 'Core') {
    const { currentHour } = getTimestamp()
    const ConsoleLog: ConsoleLogger = {
      currentHour,
      color: `${color ?? levelConfig.color}`,
      controller,
      levelColor: levelConfig.color,
      level,
      message
    }
    MakeLog(ConsoleLog); return
  }

  if (levelConfig.level <= currentLevelConfig.level) {
    const { currentHour, fulltimer } = getTimestamp()
    const ConsoleLog: ConsoleLogger = {
      currentHour,
      color: color ?? levelConfig.color,
      controller,
      levelColor: levelConfig.color,
      level,
      message
    }
    MakeLog(ConsoleLog)
    const ArchiveLog = `[ ${fulltimer} ] [ ${controller} - ${level} ] ${message}`
    registerlog(controller, ArchiveLog, level)
  }
}

function MakeLog (ConsoleLog: ConsoleLogger): void {
  const { currentHour, color, controller, levelColor, level, message } = ConsoleLog
  const cores: any = colors
  console.log(`| ${currentHour} | ${cores[color](controller)} - ${cores[levelColor](level)} | ${message}`)
}
