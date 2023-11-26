import { db } from '@/app'
import { genv4 } from './UuidGen'

export async function genButtonID (): Promise<{ Id: string, dateExpire: Date }> {
  const Id = genv4()
  const dateExpire = new Date(new Date().getTime() + 24 * 60 * 60 * 1000) // 24h
  await db.tokens.set(Id, { expireIn: dateExpire })
  return { Id, dateExpire }
}

// export function validatorID (ID: string): string {

// }
