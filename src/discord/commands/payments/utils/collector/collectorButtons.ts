import { db } from '@/app'
import { ActionRowBuilder, type ButtonInteraction, type CacheType, ModalBuilder, TextInputBuilder } from 'discord.js'
import { PaymentFunction } from './functions/functions'

export default async function collectorButtons (interaction: ButtonInteraction<CacheType>, key: string, value: any): Promise<void> {
  const { guildId, user, customId } = interaction
  const { title, label, placeholder, style, type, maxLength } = value
  if (customId === key) {
    // typeRedeem
    if (customId === 'paymentUserDM') {
      await PaymentFunction.paymentUserDM({
        interaction
      })
      return
    }
    if (customId === 'paymentUserGerarPix') {
      console.log('oi')
      return
    }
    if (customId === 'paymentUserGerarCardDebito') {
      console.log('oi')
      return
    }
    if (customId === 'paymentUserGerarCardCredito') {
      console.log('oi')
      return
    }
    if (customId === 'paymentUserWTF') {
      await PaymentFunction.paymentUserWTF({
        interaction
      })
      return
    }
    if (customId === 'paymentUserCancelar') {
      await PaymentFunction.paymentUserCancelar({
        interaction
      })
      return
    }

    const textValue = await db.payments.get(`${guildId}.process.${user.id}.${type}`)
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
