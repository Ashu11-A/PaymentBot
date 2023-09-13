import { db } from '@/app'
import { type StringSelectMenuInteraction, type CacheType } from 'discord.js'
import { buttonsConfig } from '../utils/ticketUpdateConfig'

export default async function collectorSelect (interaction: StringSelectMenuInteraction<CacheType>): Promise<void> {
  const { guildId, channelId, message } = interaction

  const values = await db.guilds.get(`${guildId}.ticket.${channelId}.messages.${message?.id}.select`)

  if (Array.isArray(values)) {
    const deleteValues = interaction.values.map(Number)
    const updatedValues = values.filter((_: any, index: any) => !deleteValues.includes(index))

    await db.guilds.set(`${guildId}.ticket.${channelId}.messages.${message?.id}.select`, updatedValues)
    await interaction.reply({
      content: '✅ Valores removidos com sucesso!',
      ephemeral: true
    })
    await buttonsConfig(interaction, message)
  } else {
    console.error('Values is not an array. Handle this case appropriately.')
  }
}
