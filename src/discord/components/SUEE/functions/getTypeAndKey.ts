export function getTypeAndKey (customId: string): string[] | null[] {
  const parts = customId.split('-')
  if (parts.length === 2) {
    return [parts[0], parts[1]]
  }
  return [null, null]
}
