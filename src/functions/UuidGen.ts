import { db } from '@/app'
import { settings } from '@/settings'
import { User } from 'discord.js'
import { NIL as nilUUID, v4 as uuidv4, v5 as uuidv5 } from 'uuid'
import { json } from './Json'

// Gera um UUID v4 aleatorío
export function genv4 (): string {
  return uuidv4()
}

// Gera um UUID v5 baseado em um namespace e um nome
export function genv5 (name: string, type: string): string {
  const set = json(settings.Logs.configPATH + '/settings.json')
  return uuidv5(name, set.namespaces[type])
}

export function nill (): string { return nilUUID }

export async function genButtonID (
  options: { isProtected?: { enabled?: boolean, user?: User } }
): Promise<{ Id: string, dateExpire: Date }> {
  const Id = genv4()
  let dataToSave: object = {}
  const isProtected = options.isProtected
  const dateExpire = new Date(new Date().getTime() + 24 * 60 * 60 * 1000) // 24h

  if (isProtected?.enabled === true && isProtected.user instanceof User) {
    dataToSave = { userId: isProtected.user.id }
  }
  await db.tokens.set(Id, { ...dataToSave, expireIn: dateExpire })
  return { Id, dateExpire }
}
