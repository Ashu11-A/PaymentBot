import { setIntervalAsync } from 'set-interval-async/fixed'
import { Event } from '@/structs/types/Event'
import { ActivityType, type PresenceStatusData } from 'discord.js'
import { client, db } from '@/app'
import axios from 'axios'

export async function updateStatus (ip: string, type: PresenceStatusData): Promise<void> {
  try {
    const res = await axios.get(`https://api.mcsrvstat.us/3/${ip}`)
    const formatRes = `${ip} | Status: ${
      res.data.online === true
        ? `Online | Players: ${res.data.players.online ?? 0}/${res.data.players.max ?? 0}`
        : 'Offline'
    }`
    console.log(`[ 'Status' ] - "${formatRes}".`)
    client?.user?.setPresence({
      activities: [{ name: formatRes, type: ActivityType.Playing }],
      status: `${type ?? 'online'}`
    })
  } catch (err) {
    console.error(err)
    client?.user?.setPresence({
      activities: [{ name: 'API Error', type: ActivityType.Playing }],
      status: 'idle'
    })
  }
}

export default new Event({
  name: 'ready',
  async run () {
    setIntervalAsync(async () => {
      const guilds = client.guilds.cache
      for (const guild of guilds.values()) {
        const enabled = await db.system.get(`${guild.id}.status.systemStatus`)
        if (enabled !== undefined && enabled === false) return

        const type = (await db.guilds.get(`${guild.id}.status.type`)) as PresenceStatusData
        const typeStatus = await db.system.get(`${guild.id}.status.systemStatusMinecraft`)
        console.log(typeStatus)

        if (typeStatus !== undefined && typeStatus === true) {
          const ip = await db.guilds.get(`${guild.id}.minecraft.ip`)
          await updateStatus(ip, type)
        } else if (typeStatus === undefined || typeStatus === false) {
          const messages = await db.messages.get(`${guild.id}.system.status.messages`)
          let currentMessage = await db.messages.get(`${guild.id}.system.status.currentMessage`)
          if (currentMessage >= messages.length || currentMessage === undefined) {
            currentMessage = 0
            await db.messages.set(`${guild.id}.system.status.currentMessage`, 0)
          }
          console.log(messages, currentMessage)
          const newStatus = messages[currentMessage]
          client?.user?.setPresence({
            activities: [{ name: newStatus, type: ActivityType.Playing }],
            status: type
          })
          console.log(`[ 'Status' ] - "${newStatus}".`)
          await db.messages.add(`${guild.id}.system.status.currentMessage`, 1)
        }
      }
    }, 15000)
  }
})
