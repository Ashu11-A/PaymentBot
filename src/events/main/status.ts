import { setIntervalAsync } from 'set-interval-async/fixed'
import { Event } from '@/structs/types/Event'
import { ActivityType } from 'discord.js'
import { client, db, config } from '@/app'
import axios from 'axios'

export default new Event({
  name: 'ready',
  async run () {
    async function updateStatus (): Promise<void> {
      const enabled = await db.system.get(`${config.Guild.ID}.status.systemStatus`)
      if (enabled !== undefined && enabled === false) return

      const IP = await db.guilds.get(`${config.Guild.ID}.minecraft.ip`)
      const res = await axios.get(`https://api.mcsrvstat.us/3/${IP}`)
      const formatRes = `${IP} | Status: ${res.data.online === true ? `Online | Players: ${res.data.players.online ?? 0}/${res.data.players.max ?? 0}` : 'Offline'}`
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
