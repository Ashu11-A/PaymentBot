import { db } from '@/app'
import { ActionRowBuilder, type ButtonInteraction, type CacheType, ModalBuilder, TextInputBuilder } from 'discord.js'
import { PaymentFunction } from './functions/collectorFunctions'
import { Payment } from '../functions/createPayment'
import { type collectorButtonsForModals } from '@/settings/interfaces/Collector'

type CustomIdHandlers = Record<string, () => Promise<void> | void>

export default async function collectorButtons (interaction: ButtonInteraction<CacheType>, key: string, value: collectorButtonsForModals): Promise<void> {
  if (!interaction.inGuild()) return

  const { guildId, customId, message } = interaction
  const { title, label, placeholder, style, type, maxLength } = value

  const customIdHandlers: CustomIdHandlers = {
    Verify: async () => { await PaymentFunction.verifyPayment({ interaction }) },
    DM: async () => { await PaymentFunction.paymentUserDM({ interaction }) },
    WTF: async () => { await PaymentFunction.paymentUserWTF({ interaction }) },
    Add: async () => { await PaymentFunction.AddOrRem({ interaction, type: 'Add' }) },
    Rem: async () => { await PaymentFunction.AddOrRem({ interaction, type: 'Rem' }) },
    GerarPix: async () => { await Payment.create({ interaction, method: 'pix' }) },
    Cancelar: async () => { await PaymentFunction.paymentUserCancelar({ interaction }) },
    Next: async () => { await PaymentFunction.NextOrBefore({ interaction, type: 'next' }) },
    Before: async () => { await PaymentFunction.NextOrBefore({ interaction, type: 'before' }) },
    GerarCardDebito: async () => { await Payment.create({ interaction, method: 'debit_card' }) },
    GerarCardCredito: async () => { await Payment.create({ interaction, method: 'credit_card' }) }
  }

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
          value: textValue ?? undefined,
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
