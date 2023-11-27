import { db } from '@/app'
import { type collectorButtonsForModals } from '@/settings/interfaces/Collector'
import { ActionRowBuilder, ModalBuilder, TextInputBuilder, type ButtonInteraction, type CacheType } from 'discord.js'
import { Payment } from '../functions/createPayment'
import { PaymentFunction } from './functions/cartCollectorFunctions'

type CustomIdHandlers = Record<string, () => Promise<void> | void>

export default async function collectorCartButtons (options: {
  interaction: ButtonInteraction<CacheType>
  key: string
  value?: collectorButtonsForModals
}): Promise<void> {
  const { interaction, key, value } = options
  if (!interaction.inGuild()) return
  const { guildId, customId, message } = interaction
  const { title, label, placeholder, style, type, maxLength } = value

  const customIdHandlers: CustomIdHandlers = {
    Verify: async () => { await PaymentFunction.verifyPayment({ interaction }) },
    DM: async () => { await PaymentFunction.paymentUserDM({ interaction }) },
    WTF: async () => { await PaymentFunction.paymentUserWTF({ interaction }) },
    Add: async () => { await PaymentFunction.AddOrRem({ interaction, type: 'Add' }) },
    Rem: async () => { await PaymentFunction.AddOrRem({ interaction, type: 'Rem' }) },
    Pix: async () => { await Payment.create({ interaction, method: 'pix' }) },
    Cancelar: async () => { await PaymentFunction.paymentUserCancelar({ interaction }) },
    Next: async () => { await PaymentFunction.NextOrBefore({ interaction, type: 'next' }) },
    Before: async () => { await PaymentFunction.NextOrBefore({ interaction, type: 'before' }) },
    CardDebito: async () => { await Payment.create({ interaction, method: 'debit_card' }) },
    CardCredito: async () => { await Payment.create({ interaction, method: 'credit_card' }) }
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
