import { db } from '@/app'
import { createCart } from '@/discord/components/payments'
import { UpdateProduct } from '@/discord/components/payments/product/functions/updateProduct'
import { ProductButtonCollector } from '@/discord/components/payments/product/functions/buttonsCollector'
import { Database } from '@/functions'
import { ActionRowBuilder, ModalBuilder, TextInputBuilder, type ButtonInteraction, type CacheType } from 'discord.js'
import { getModalData } from './functions/getModalData'
import { type CustomIdHandlers } from '@/interfaces'

export async function productCollectorButtons (options: { interaction: ButtonInteraction<CacheType>, key: string }): Promise<void> {
  const { interaction, key } = options
  if (!interaction.inGuild()) return

  const { guildId, message, channelId } = interaction
  const Product = new UpdateProduct({ interaction, message })
  const ProductButton = new ProductButtonCollector({ interaction, message })

  const customIdHandlers: CustomIdHandlers = {
    Save: async () => { await ProductButton.buttonsUsers() },
    Config: async () => { await Product.buttonsConfig({ switchBotton: true }) },
    Status: async () => { await ProductButton.paymentStatus() },
    Buy: async () => { await createCart(interaction) },
    SetEstoque: async () => {
      await new Database({ interaction, pathDB: `payments.${channelId}.messages.${message.id}.properties`, typeDB: 'messages' }).setDelete({
        systemName: key,
        displayName: 'Estoque',
        enabledType: 'swap',
        otherSystemNames: ['SetCtrlPanel', 'SetPterodactyl']
      })
      await Product.embed({ button: key })
    },
    SetCtrlPanel: async () => {
      await new Database({ interaction, pathDB: `payments.${channelId}.messages.${message.id}.properties`, typeDB: 'messages' }).setDelete({
        systemName: key,
        displayName: 'CtrlPanel',
        enabledType: 'swap',
        otherSystemNames: ['SetEstoque', 'SetPterodactyl']
      })
      await Product.embed({ button: key })
    },
    SetPterodactyl: async () => {
      await new Database({ interaction, pathDB: `payments.${channelId}.messages.${message.id}.properties`, typeDB: 'messages' }).setDelete({
        systemName: key,
        displayName: 'Pterodactyl',
        enabledType: 'swap',
        otherSystemNames: ['SetEstoque', 'SetCtrlPanel']
      })
      await Product.embed({ button: key })
    },
    Export: async () => {
      await ProductButton.export()
      await db.messages.set(`${guildId}.payments.${channelId}.messages.${message.id}.properties.${key}`, true)
    },
    Import: async () => { await ProductButton.import() },
    Delete: async () => { await ProductButton.delete() },
    Egg: async () => { await ProductButton.NestSelect({}) }
  }

  const customIdHandler = customIdHandlers[key]

  if (typeof customIdHandler === 'function') {
    if (key !== 'Egg') await interaction.deferReply({ ephemeral })
    await customIdHandler()
  } else {
    const { title, label, placeholder, style, type, maxLength, db: dataDB } = getModalData(key)
    const textValue = await db.messages.get(`${guildId}.payments.${channelId}.messages.${message.id}.${dataDB}`)
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
          maxLength,
          type
        })
      ]
    })

    modal.setComponents(content)
    await interaction.showModal(modal)
  }
}
