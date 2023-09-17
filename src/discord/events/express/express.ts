import { Event } from '@/discord/base'
import Express from './server/index'
import randomstring from 'randomstring'
import { db } from '@/app'

export default new Event({
  name: 'ready',
  once: true,
  async run () {
    const pass = randomstring.generate({ length: 128 })
    await db.tokens.set('token', pass)

    Express()
  }
})
