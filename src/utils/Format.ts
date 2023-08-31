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
