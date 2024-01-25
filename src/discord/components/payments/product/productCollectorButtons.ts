import { db } from '@/app'
import { createCart, UpdateProduct } from '@/discord/components/payments'
import { Database } from '@/functions'
import { ActionRowBuilder, ModalBuilder, TextInputBuilder, type ButtonInteraction, type CacheType } from 'discord.js'
import { getModalData } from './functions/getModalData'
import { type CustomIdHandlers } from '@/settings/interfaces/Collector'

export async function productCollectorButtons (options: { interaction: ButtonInteraction<CacheType>, key: string }): Promise<void> {
  const { interaction, key } = options
  if (!interaction.inGuild()) return

  const { guildId, message, channelId } = interaction
  const productBuilder = new UpdateProduct({ interaction, message })

  const customIdHandlers: CustomIdHandlers = {
    Save: async () => { await productBuilder.buttonsUsers() },
    Config: async () => { await productBuilder.buttonsConfig({ switchBotton: true }) },
    Status: async () => { await productBuilder.paymentStatus() },
    Buy: async () => { await createCart(interaction) },
    SetEstoque: async () => {
      await new Database({ interaction, pathDB: `payments.${channelId}.messages.${message.id}.properties`, typeDB: 'messages' }).setDelete({
        systemName: key,
        displayName: 'Estoque',
        enabledType: 'swap',
        otherSystemNames: ['SetCtrlPanel']
      })
      await productBuilder.embed({ button: key })
    },
    SetCtrlPanel: async () => {
      await new Database({ interaction, pathDB: `payments.${channelId}.messages.${message.id}.properties`, typeDB: 'messages' }).setDelete({
        systemName: key,
        displayName: 'CtrlPanel',
        enabledType: 'swap',
        otherSystemNames: ['SetEstoque']
      })
      await productBuilder.embed({ button: key })
    },
    Export: async () => {
      await productBuilder.export()
      await db.messages.set(`${guildId}.payments.${channelId}.messages.${message.id}.properties.${key}`, true)
    },
    Import: async () => { await productBuilder.import() },
    Delete: async () => { await productBuilder.delete() }
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
