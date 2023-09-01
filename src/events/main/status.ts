import { setIntervalAsync } from 'set-interval-async/fixed'
import { Event } from '@/structs/types/Event'
import { ActivityType } from 'discord.js'
import { client } from '@/app'
import axios from 'axios'

export default new Event({
  name: 'ready',
  async run () {
    async function updateStatus (): Promise<void> {
      const res = await axios.get('https://api.mcsrvstat.us/3/rederavard.com')
      const formatRes = `rederavard.com | Status: ${res.data.online === true ? `Online | Players: ${res.data.players.online ?? 0}/${res.data.players.max ?? 0}` : 'Offline'}`
      console.log(`[ 'Status' ] - "${formatRes}".`)
      client?.user?.setPresence({
        activities: [{ name: formatRes, type: ActivityType.Playing }],
        status: `${res.data.online === true ? 'online' : 'dnd'}`
      })
    }
    await updateStatus()
    setIntervalAsync(async () => {
      await updateStatus()
    }, 1000 * 60 * 3)
  }
})
