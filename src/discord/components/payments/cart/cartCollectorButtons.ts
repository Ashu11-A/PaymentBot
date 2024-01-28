import { db } from '@/app'
import { ActionRowBuilder, ModalBuilder, TextInputBuilder, type ButtonInteraction, type CacheType } from 'discord.js'
import { createPayment } from '../functions/createPayment'
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
  const PaymentBuilder = new PaymentFunction({ interaction, key })

  const customIdHandlers: CustomIdHandlers = {
    Verify: async () => { await PaymentBuilder.verifyPayment() },
    DM: async () => { await PaymentBuilder.DM() },
    WTF: async () => { await PaymentBuilder.WTF() },
    Add: async () => { await PaymentBuilder.AddOrRem({ type: 'Add' }) },
    Rem: async () => { await PaymentBuilder.AddOrRem({ type: 'Rem' }) },
    Remove: async () => { await PaymentBuilder.RemoveItem() },
    Pix: async () => { await createPayment({ interaction, method: 'pix' }) },
    Cancelar: async () => { await PaymentBuilder.Cancelar() },
    Next: async () => { await PaymentBuilder.NextOrBefore({ type: 'next' }) },
    Before: async () => { await PaymentBuilder.NextOrBefore({ type: 'before' }) },
    CardDebito: async () => { await createPayment({ interaction, method: 'debit_card' }) },
    CardCredito: async () => { await createPayment({ interaction, method: 'credit_card' }) }
  }

  const customIdHandler = customIdHandlers[key]

  if (typeof customIdHandler === 'function') {
    await interaction.deferReply({ ephemeral })
    await customIdHandler()
  } else {
    const { title, label, placeholder, style, type, maxLength, db: dataDB } = getModalData(key)
    const textValue = await db.payments.get(`${guildId}.process.${channelId}.${dataDB}`)
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
          maxLength,
          type
        })
      ]
    })
    modal.setComponents(content)
    await interaction.showModal(modal)
  }
}
