import fs from 'fs'
import path, { resolve } from 'path'
import { unlinkfolders } from '@/controllers/loggings/unlinkfolders'
import { dirCR } from '@/functions'
import { settings } from '@/settings'
import { getTimestamp } from '@/controllers/loggings/getTimestamp'
const LOG_STORAGE_PATH = settings.Logs.loggingsPATH // Path das logs
export function registerlog(level: string, message:string, Sublevel:string) {
  const logFileName = `${getTimestamp().dayTimer}_${level.toLowerCase()}.log`
  const logFolderPath = resolve(LOG_STORAGE_PATH, level, (Sublevel ?? ''))
  const logFilePath = path.join(logFolderPath, logFileName)

  dirCR(logFolderPath)
  fs.appendFileSync(logFilePath, message + '\n')

  // Verifica e deleta o arquivo mais antigo
  unlinkfolders(logFolderPath, level)
}
