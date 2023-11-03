import { setIntervalAsync } from 'set-interval-async/fixed'
import { Event } from '@/discord/base'
import statusPresence from './statusPresence'
import moduleExpress from '@/express/express'
import { telegramNotify } from './telegram'

export default new Event({
  name: 'ready',
  async run () {
    await statusPresence()
    await moduleExpress()
    await telegramNotify()
    setIntervalAsync(async () => {
      await statusPresence()
    }, 15000)
  }
})
