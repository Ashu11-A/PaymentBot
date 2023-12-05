import { db } from '@/app'
import { createCart, updateProduct } from '@/discord/components/payments'
import { Database } from '@/functions'
import { ActionRowBuilder, ModalBuilder, TextInputBuilder, type ButtonInteraction, type CacheType } from 'discord.js'
import { getModalData } from './functions/getModalData'
import { type CustomIdHandlers } from '@/settings/interfaces/Collector'

export async function productCollectorButtons (options: { interaction: ButtonInteraction<CacheType>, key: string }): Promise<void> {
  const { interaction, key } = options
  if (!interaction.inGuild()) return

  const { guildId, message, channelId } = interaction

  const customIdHandlers: CustomIdHandlers = {
    Save: async () => { await updateProduct.buttonsUsers({ interaction, message }) },
    Config: async () => { await updateProduct.buttonsConfig({ interaction, message, switchBotton: true }) },
    Status: async () => { await updateProduct.paymentStatus({ interaction, message }) },
    Buy: async () => { await createCart(interaction) },
    SetEstoque: async () => {
      await Database.setDelete({
        interaction,
        systemName: key,
        pathDB: `payments.${channelId}.messages.${message.id}.properties`,
        displayName: 'Estoque',
        typeDB: 'messages',
        enabledType: 'swap',
        otherSystemNames: ['SetCtrlPanel']
      })
      await updateProduct.embed({ interaction, message, button: key })
    },
    SetCtrlPanel: async () => {
      await Database.setDelete({
        interaction,
        systemName: key,
        pathDB: `payments.${channelId}.messages.${message.id}.properties`,
        displayName: 'CtrlPanel',
        typeDB: 'messages',
        enabledType: 'swap',
        otherSystemNames: ['SetEstoque']
      })
      await updateProduct.embed({ interaction, message, button: key })
    },
    Export: async () => {
      await updateProduct.export({ interaction, message })
      await db.messages.set(`${guildId}.payments.${channelId}.messages.${message.id}.properties.${key}`, true)
    },
    Import: async () => { await updateProduct.import({ interaction, message }) }

  }

  const customIdHandler = customIdHandlers[key]

  if (typeof customIdHandler === 'function') {
    await interaction.deferReply({ ephemeral })
    await customIdHandler()
  } else {
    const { title, label, placeholder, style, type, maxLength } = getModalData(key)
    const textValue = await db.messages.get(`${guildId}.payments.${channelId}.messages.${message.id}.${type}`)
    const modal = new ModalBuilder({ customId: interaction.customId, title })
    const content = new ActionRowBuilder<TextInputBuilder>({
      components: [
        new TextInputBuilder({
          custom_id: 'content',
          label,
          placeholder,
          value: typeof textValue === 'number' ? String(textValue) : textValue ?? null,
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
