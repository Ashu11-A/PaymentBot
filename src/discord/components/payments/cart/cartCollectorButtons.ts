import { db } from '@/app'
import { ActionRowBuilder, ModalBuilder, TextInputBuilder, type ButtonInteraction, type CacheType } from 'discord.js'
import { Payment } from '../functions/createPayment'
import { PaymentFunction } from './functions/cartCollectorFunctions'
import { getModalData } from './functions/getModalData'
import { type CustomIdHandlers } from '@/settings/interfaces/Collector'

export default async function cartCollectorButtons (options: {
  interaction: ButtonInteraction<CacheType>
  key: string
}): Promise<void> {
  const { interaction, key } = options
  if (!interaction.inGuild()) return
  const { guildId, channelId } = interaction

  const customIdHandlers: CustomIdHandlers = {
    Verify: async () => { await PaymentFunction.verifyPayment({ interaction }) },
    DM: async () => { await PaymentFunction.DM({ interaction, key }) },
    WTF: async () => { await PaymentFunction.WTF({ interaction, key }) },
    Add: async () => { await PaymentFunction.AddOrRem({ interaction, type: 'Add' }) },
    Rem: async () => { await PaymentFunction.AddOrRem({ interaction, type: 'Rem' }) },
    Remove: async () => { await PaymentFunction.RemoveItem({ interaction }) },
    Pix: async () => { await Payment.create({ interaction, method: 'pix' }) },
    Cancelar: async () => { await PaymentFunction.Cancelar({ interaction }) },
    Next: async () => { await PaymentFunction.NextOrBefore({ interaction, type: 'next' }) },
    Before: async () => { await PaymentFunction.NextOrBefore({ interaction, type: 'before' }) },
    CardDebito: async () => { await Payment.create({ interaction, method: 'debit_card' }) },
    CardCredito: async () => { await Payment.create({ interaction, method: 'credit_card' }) }
  }

  const customIdHandler = customIdHandlers[key]

  if (typeof customIdHandler === 'function') {
    await interaction.deferReply({ ephemeral })
    await customIdHandler()
  } else {
    const { title, label, placeholder, style, type, maxLength } = getModalData(key)
    const textValue = await db.payments.get(`${guildId}.process.${channelId}.${type}`)
    const modal = new ModalBuilder({ customId: interaction.customId, title })
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
