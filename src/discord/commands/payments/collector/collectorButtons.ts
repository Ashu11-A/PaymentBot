import { db } from '@/app'
import { ActionRowBuilder, type ButtonInteraction, type CacheType, ModalBuilder, TextInputBuilder } from 'discord.js'
import { buttonsUsers, paymentButtonsConfig } from '@/discord/commands/payments/utils/paymentUpdateConfig'

export default async function collectorButtons (interaction: ButtonInteraction<CacheType>, key: string, value: any): Promise<void> {
  const { guildId, message, channelId, customId } = interaction
  const { title, label, placeholder, style, type, maxLength } = value
  if (customId === key) {
    if ((interaction?.memberPermissions?.has('Administrator')) === false) {
      await interaction.reply({
        content: '**❌ - Você não possui permissão para utilizar este botão!**',
        ephemeral: true
      })
      return
    }

    if (customId === 'paymentSave' || customId === 'paymentConfig' || customId === 'paymentStatus') {
      await interaction.reply({ content: '⏱️ | Aguarde só um pouco...', ephemeral: true })

      if (customId === 'paymentSave') {
        await buttonsUsers(interaction, message)
      }

      if (customId === 'paymentConfig') {
        await paymentButtonsConfig(interaction, message)
      }

      if (customId === 'paymentStatus') {
        let { status } = await db.messages.get(`${guildId}.payments.${channelId}.messages.${message.id}`)
        if (status === undefined || status === false) {
          status = true
        } else {
          status = false
        }

        await db.messages.set(`${guildId}.payments.${channelId}.messages.${message.id}.status`, status)
        await paymentButtonsConfig(interaction, message)
      }
      return
    }

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
