import { Event } from '@/structs/types/Event'
import Express from './server/index'
import randomstring from 'randomstring'
import { db } from '@/app'

export default new Event({
  name: 'ready',
  once: true,
  async run () {
    const pass = randomstring.generate({ length: 128 })
    await db.token.set('token', pass)

    Express()
  }
})
