import { db } from '@/app'
import { type StringSelectMenuInteraction, type CacheType } from 'discord.js'
import { buttonsConfig } from '../utils/ticketUpdateConfig'
import { createTicket } from '../utils/createTicket'

export async function deleteSelect (interaction: StringSelectMenuInteraction<CacheType>): Promise<void> {
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

export async function collectorSelect (interaction: StringSelectMenuInteraction<CacheType>): Promise<void> {
  const { values, guildId } = interaction

  const [posição, channelId, messageID] = values[0].split('_')

  console.log(posição, channelId, messageID)

  const infos = await db.guilds.get(`${guildId}.ticket.${channelId}.messages.${messageID}.select`)

  if (Number(posição) >= 0 && Number(posição) < infos.length) {
    const { title, description } = infos[Number(posição)]
    await createTicket(interaction, (title + '\n' + description))
  } else {
    console.log('Posição inválida no banco de dados.')
    await interaction.reply({ content: '❌ | As informações do Banco de dados estão desatualizadas', ephemeral: true })
  }

  console.log(infos)
}
