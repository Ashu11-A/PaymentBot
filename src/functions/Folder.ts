import fs from 'fs'
import path from 'path'

export function dirCR (folderPath: string): void {
  if (!fs.existsSync(folderPath)) { fs.mkdirSync(folderPath, { recursive: true }) }
}

export function dirEX (folderPath: string): boolean {
  if (fs.existsSync(folderPath)) {
    return true
  } else {
    return false
  }
}

export function dirSC (folderPath: string): object {
  const scannedFiles: any[] = []

  function scanDir (directory: string): void {
    const files = fs.readdirSync(directory)

    files.forEach((file) => {
      const filePath = path.join(directory, file)
      const stat = fs.statSync(filePath)

      const fileInfo: object = {
        name: file,
        path: filePath,
        isDirectory: stat.isDirectory(),
        size: stat.size,
        createdAt: stat.birthtime,
        modifiedAt: stat.mtime,
        accessedAt: stat.atime
      }

      scannedFiles.push(fileInfo)

      if (stat.isDirectory()) {
        scanDir(filePath)
      }
    })
  }

  scanDir(folderPath)
  return scannedFiles
}
