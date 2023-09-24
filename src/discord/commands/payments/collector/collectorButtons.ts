import { db } from '@/app'
import { ActionRowBuilder, type ButtonInteraction, type CacheType, ModalBuilder, TextInputBuilder } from 'discord.js'
import { updateProduct } from '@/discord/commands/payments/utils/updateProduct'
import { Discord } from '@/functions/Discord'
import { createPayment } from '../utils/createPayment'
import { Database } from '../../configs/utils/setDatabase'

type CustomIdHandlers = Record<string, () => Promise<void> | void>

export default async function collectorButtons (interaction: ButtonInteraction<CacheType>, key: string, value: any): Promise<void> {
  const { guildId, message, channelId, customId } = interaction
  const { title, label, placeholder, style, type, maxLength } = value
  const havePermision = await Discord.Permission(interaction, 'Administrator')
  if (havePermision) return

  const customIdHandlers: CustomIdHandlers = {
    paymentSave: async () => { await updateProduct.buttonsUsers({ interaction, message }) },
    paymentConfig: async () => { await updateProduct.buttonsConfig({ interaction, message }) },
    paymentStatus: async () => {
      let { status } = await db.messages.get(`${guildId}.payments.${channelId}.messages.${message.id}`)
      if (status === undefined || status === false) {
        status = true
      } else {
        status = false
      }

      await db.messages.set(`${guildId}.payments.${channelId}.messages.${message.id}.status`, status)
      await updateProduct.buttonsConfig({
        interaction,
        message
      })
    },
    paymentBuy: async () => { await createPayment(interaction) },
    paymentSetEstoque: async () => {
      await Database.setDelete({
        interaction,
        systemName: key,
        pathDB: `payments.${channelId}.messages.${message.id}.properties`,
        displayName: 'Estoque',
        typeDB: 'messages',
        enabledType: 'switch',
        otherSystemNames: ['paymentSetCtrlPanel']
      })
      await updateProduct.buttonsConfig({
        interaction,
        message
      })
    },
    paymentSetCtrlPanel: async () => {
      await Database.setDelete({
        interaction,
        systemName: key,
        pathDB: `payments.${channelId}.messages.${message.id}.properties`,
        displayName: 'CtrlPanel',
        typeDB: 'messages',
        enabledType: 'switch',
        otherSystemNames: ['paymentSetEstoque']
      })
      await updateProduct.buttonsConfig({
        interaction,
        message
      })
    }
  }

  if (customId === key) {
    const customIdHandler = customIdHandlers[customId]

    if (typeof customIdHandler === 'function') {
      await customIdHandler()
    } else {
      const textValue = await db.messages.get(`${guildId}.payments.${channelId}.messages.${message.id}.${type}`)
      const modal = new ModalBuilder({ customId: key, title })
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
}
