import { db } from '@/app'
import { buttonsConfig } from '@/commands/tickets/utils/ticketUpdateConfig'
import { Event } from '@/structs/types/Event'

export default new Event({
  name: 'interactionCreate',
  async run (interaction) {
    if (interaction.isButton()) {
      const { customId } = interaction
      if (customId === 'ticketSetSelect' || customId === 'ticketSetButton') {
        const { guildId, channelId, message } = interaction
        if (customId === 'ticketSetSelect') {
          await db.guilds.set(`${guildId}.ticket.${channelId}.messages.${message.id}.properties.ticketSetSelect`, true)
          await db.guilds.set(`${guildId}.ticket.${channelId}.messages.${message.id}.properties.ticketSetButton`, false)
        } else {
          await db.guilds.set(`${guildId}.ticket.${channelId}.messages.${message.id}.properties.ticketSetButton`, true)
          await db.guilds.set(`${guildId}.ticket.${channelId}.messages.${message.id}.properties.ticketSetSelect`, false)
        }
        await interaction.reply({ content: '⏱️ | Aguarde só um pouco...', ephemeral: true })
        await buttonsConfig(interaction, message)
      }
    }
  }
})
