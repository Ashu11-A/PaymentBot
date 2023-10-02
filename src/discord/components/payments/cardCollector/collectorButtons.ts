import { db } from '@/app'
import { ActionRowBuilder, type ButtonInteraction, type CacheType, ModalBuilder, TextInputBuilder } from 'discord.js'
import { PaymentFunction } from './functions/collectorFunctions'
import { createPayment } from '../functions/createPayment'

type CustomIdHandlers = Record<string, () => Promise<void> | void>

export default async function collectorButtons (interaction: ButtonInteraction<CacheType>, key: string, value: any): Promise<void> {
  if (!interaction.inGuild()) return

  const { guildId, customId, message } = interaction
  const { title, label, placeholder, style, type, maxLength } = value

  const customIdHandlers: CustomIdHandlers = {
    paymentUserDM: async () => { await PaymentFunction.paymentUserDM({ interaction }) },
    paymentUserWTF: async () => { await PaymentFunction.paymentUserWTF({ interaction }) },
    paymentUserAdd: async () => { await PaymentFunction.AddOrRem({ interaction, type: 'Add' }) },
    paymentUserRem: async () => { await PaymentFunction.AddOrRem({ interaction, type: 'Rem' }) },
    paymentUserGerarPix: async () => { await createPayment.embed({ interaction, method: 'pix' }) },
    paymentUserCancelar: async () => { await PaymentFunction.paymentUserCancelar({ interaction }) },
    paymentUserNext: async () => { await PaymentFunction.NextOrBefore({ interaction, type: 'next' }) },
    paymentUserBefore: async () => { await PaymentFunction.NextOrBefore({ interaction, type: 'before' }) },
    paymentUserGerarCardDebito: async () => { await createPayment.embed({ interaction, method: 'debit_card' }) },
    paymentUserGerarCardCredito: async () => { await createPayment.embed({ interaction, method: 'credit_card' }) }
  }

  if (customId === key) {
    const customIdHandler = customIdHandlers[customId]

    if (typeof customIdHandler === 'function') {
      await interaction.deferReply({ ephemeral })
      await customIdHandler()
    } else {
      const textValue = await db.payments.get(`${guildId}.process.${message.id}.${type}`)
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
