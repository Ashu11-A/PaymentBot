// Sistema de Verificação de Mensagens Apagadas (SVMA)

import { db } from '@/app'
import { Event } from '@/discord/base'
import { Discord } from '@/functions'

export default new Event({
  name: 'messageDelete',
  async run (message) {
    const { guildId, channelId, id, guild, interaction } = message
    const categories = ['payments', 'ticket']

    for (const category of categories) {
      const key = `${guildId}.${category}.${channelId}.messages.${id}`

      if (await db.messages.has(key)) {
        await db.messages.delete(key)
          .then(async () => {
            if (interaction !== null) {
              await Discord.sendLog({
                interaction,
                guild,
                type: 'warn',
                cause: 'messageDelete',
                color: 'Red',
                infos: []
              })
            }
            console.log(`Mensagem apagada em ${category}: ${id}`)
          })
      }
    }
  }
})
