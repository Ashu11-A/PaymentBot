import { db } from '@/app'
import { ActionRowBuilder, type CacheType, ModalBuilder, TextInputBuilder, type ButtonInteraction } from 'discord.js'
import { createTicket } from '../utils/createTicket'

export default async function collectorButtons (interaction: ButtonInteraction<CacheType>, value: any): Promise<void> {
  console.log(interaction.customId)
  const { guildId, message, channelId, customId } = interaction
  const { title, label, placeholder, style, type, maxLength } = value

  if (customId === 'ticketOpen') {
    await createTicket(interaction)
    return
  }

  if ((interaction?.memberPermissions?.has('Administrator')) === false) {
    await interaction.reply({
      content: '**❌ - Você não possui permissão para utilizar este botão!**',
      ephemeral: true
    })
    return
  }

  const textValue = await db.guilds.get(`${guildId}.ticket.${channelId}.messages.${message.id}.${type}`)
  const modal = new ModalBuilder({ customId, title })
  const content = new ActionRowBuilder<TextInputBuilder>({
    components: [
      new TextInputBuilder({
        custom_id: 'content',
        label,
        placeholder,
        value: textValue ?? null,
        style,
        required: true,
        maxLength
      })
    ]
  })
  modal.setComponents(content)
  await interaction.showModal(modal)
}
