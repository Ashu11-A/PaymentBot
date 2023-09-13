import { db } from '@/app'
import { ActionRowBuilder, type CacheType, ModalBuilder, TextInputBuilder, type ButtonInteraction } from 'discord.js'
import { createTicket } from '../utils/createTicket'

const listItens = {
  SetName: {
    label: '❓| Qual será o Título?',
    placeholder: 'Ex: Parceria',
    style: 1,
    valuee: undefined,
    maxLength: 256,
    type: 'title'
  },
  SetDesc: {
    label: '❓| Qual será a Descrição?',
    placeholder: 'Ex: Quero me tornar um parceiro.',
    style: 1,
    valuee: undefined,
    maxLength: 256,
    type: 'description'
  },
  SetEmoji: {
    label: '❓| Qual será o Emoji? (somente um)',
    placeholder: 'Ex: 🎟️🎫💰🎲💵🗂️.',
    valuee: '🎟️',
    style: 1,
    maxLength: 10,
    type: 'emoji'
  }
}

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

  if (customId === 'ticketAddSelect') {
    const modal = new ModalBuilder({ customId: 'ticketSelectMenu', title: 'Adicionar Opções no Select Menu' })
    Object.entries(listItens).map(async ([, value]) => {
      const { label, placeholder, style, type, maxLength, valuee } = value
      const content = new ActionRowBuilder<TextInputBuilder>({
        components: [
          new TextInputBuilder({
            custom_id: type,
            label,
            placeholder,
            style,
            value: valuee,
            required: true,
            maxLength
          })
        ]
      })
      modal.addComponents(content)
    })
    await interaction.showModal(modal)
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
