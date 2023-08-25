import { v4 as uuidv4, v5 as uuidv5, NIL as nilUUID } from 'uuid'
import { json } from 'utils/Json'
import { config } from '@/app'

// Gera um UUID v4 aleatorío
export function genv4 (): string {
  return uuidv4()
}

// Gera um UUID v5 baseado em um namespace e um nome
export function genv5 (name: string, type: string): string {
  const set = json(config.Logs.configPATH + '/settings.json')
  return uuidv5(name, set.namespaces[type])
}

export function nill (): string { return nilUUID }
