import Express from './server/index'
import randomstring from 'randomstring'
import { db } from '@/app'

export default async function moduleExpress (): Promise<void> {
  const pass = randomstring.generate({ length: 128 })
  await db.tokens.set('token', pass)

  Express()
}
