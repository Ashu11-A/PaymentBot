import fs, { statSync } from 'fs'
import path, { join } from 'path'
import { json } from 'utils/Json'
import { logs } from 'controllers/loggings/logs'
import { config } from '@/app'

const core = (levelsss: string, message: string): void => { logs('Loggings', message, 'green', levelsss) }

export function unlinkfolders (logFolderPath: string, level: string): void {
  const loggings = json(config.Logs.configPATH + '/loggings.json')
  const logFilesPattern = new RegExp(`.*_${level.toLowerCase()}.log.txt`)
  const logFiles = fs.readdirSync(logFolderPath)
    .filter(file => logFilesPattern.test(file))
    .sort((a, b) => {
      const aStat = statSync(join(logFolderPath, a))
      const bStat = statSync(join(logFolderPath, b))
      return aStat.mtime.getTime() - bStat.mtime.getTime()
    })

  const maxLogFileCount = loggings.autodelete ?? 9999 // sistema de deletar logs, padrão 10
  const ActiveDelete = loggings.activedelete ?? 'on' // ativa o sistema de deletar logs,

  if (ActiveDelete === 'on') {
    if (logFiles.length > maxLogFileCount) {
      const filesToDelete = logFiles.slice(0, logFiles.length - maxLogFileCount) // Get the oldest files to delete
      filesToDelete.forEach(file => {
        const filePath = path.join(logFolderPath, file)
        core('Info', `log antiga deletada : ${filePath}`)

        fs.unlinkSync(filePath)
      })
    }
  }
}
