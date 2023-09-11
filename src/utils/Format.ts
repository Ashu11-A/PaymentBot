import axios from 'axios'

export function zeroPad (number: number): string {
  return number < 10 ? String(number) : `0${number}`
}

export function brBuilder (...text: string[]): string {
  return text.join('\n')
}

export function hexToRgb (hex: any): any {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return (result != null)
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    : null
}

export async function calculateImageSize (url: string): Promise<number> {
  try {
    const response = await axios.head(url)

    const contentLengthHeader = response.headers['content-length']
    if (contentLengthHeader !== null) {
      const imageSize = parseInt(contentLengthHeader, 10)
      return imageSize
    } else {
      throw new Error('Content-Length header not found')
    }
  } catch (error) {
    console.error('Error calculating image size:', error)
    throw error
  }
}

export function formatBytes (bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}
