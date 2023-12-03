import { db } from '@/app'
import { TicketButtons } from '@/discord/components/tickets'
import { type CustomIdHandlers } from '@/settings/interfaces/Collector'
import { ActionRowBuilder, ModalBuilder, TextInputBuilder, type ButtonInteraction, type CacheType } from 'discord.js'
import { getModalData } from './functions/getModalData'

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

export default async function ticketCollectorButtons (options: {
  interaction: ButtonInteraction<CacheType>
  key: string
}): Promise<void> {
  const { interaction, key } = options
  const { guildId, message, channelId, customId } = interaction
  const Constructor = new TicketButtons({ interaction })

  const customIdHandlers: CustomIdHandlers = {
    Open: async () => { await Constructor.createTicket({ about: 'Não foi possível descobrir.' }) },
    SetSelect: async () => { await Constructor.setSystem({ type: 'select' }) },
    SetButton: async () => { await Constructor.setSystem({ type: 'button' }) },
    SendSave: async () => { await Constructor.sendSave(key) },
    AddSelect: async () => {
      const modal = new ModalBuilder({ customId, title: 'Adicionar Opções no Select Menu' })
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
    },
    delTicket: async () => { await Constructor.delete({ type: 'delTicket' }) },
    EmbedDelete: async () => { await Constructor.delete({ type: 'EmbedDelete' }) }
  }

  const customIdHandler = customIdHandlers[key]

  if (typeof customIdHandler === 'function') {
    if (key !== 'AddSelect' && key !== 'SendSave') await interaction.deferReply({ ephemeral })
    await customIdHandler()
  } else {
    const { title, label, placeholder, style, type, maxLength } = getModalData(key)
    const textValue = await db.messages.get(`${guildId}.ticket.${channelId}.messages.${message.id}.${type}`)
    console.log('yo: ' + customId)
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
}
