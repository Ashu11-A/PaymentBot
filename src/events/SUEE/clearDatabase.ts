// Sistema de Verificação de Mensagens Apagadas (SVMA)

import { LogsDiscord, db } from '@/app'
import { Event } from '@/structs/types/Event'
import { type MessageInteraction } from 'discord.js'

export default new Event({
  name: 'messageDelete',
  async run (message) {
    const { guildId, channelId, id, guild, interaction } = message
    console.log(`Guild: ${guildId} - Channel: ${channelId} - ID: ${id} - User: ${interaction?.user.id}`)

    const categories = ['payments', 'ticket']

    for (const category of categories) {
      const key = `${guildId}.${category}.${channelId}.messages.${id}`

      if (await db.messages.has(key)) {
        await db.messages.delete(key)
          .then(async () => {
            await LogsDiscord(
              interaction as MessageInteraction,
              guild,
              'warn',
              'messageDelete',
              'Red',
              []
            )
            console.log(`Mensagem apagada em ${category}: ${id}`)
          })
      }
    }
  }
})
