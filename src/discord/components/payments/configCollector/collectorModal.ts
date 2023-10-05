import { Database } from '@/functions'
import { type ModalSubmitInteraction, type CacheType } from 'discord.js'

export default async function collectorModal (interaction: ModalSubmitInteraction<CacheType>, key: string, value: any): Promise<void> {
  if (!interaction.inGuild()) return

  await interaction.deferReply({ ephemeral })

  const { customId, fields } = interaction
  if (customId === 'mcConfig') {
    const token = fields.getTextInputValue('token')
    const ipnURL = fields.getTextInputValue('ipn')
    const taxaPix = fields.getTextInputValue('taxaPix')
    const taxaCardDebit = fields.getTextInputValue('taxaCardDebit')
    const taxaCardCredit = fields.getTextInputValue('taxaCardCredit')

    if (token !== undefined && token !== '') {
      await Database.set({
        interaction,
        data: token,
        pathDB: 'config.mcToken',
        text: 'setado para autenticação',
        typeDB: 'payments'
      })
    }

    if (ipnURL !== undefined) {
      await Database.set({
        interaction,
        data: ipnURL,
        pathDB: 'config.ipn',
        typeDB: 'payments'
      })
    }

    if (taxaPix !== undefined) {
      await Database.set({
        interaction,
        data: taxaPix,
        pathDB: 'config.taxes.pix',
        text: 'setado para taxa do Pix',
        typeDB: 'payments'
      })
    }
    if (taxaCardDebit !== undefined) {
      await Database.set({
        interaction,
        data: taxaCardDebit,
        pathDB: 'config.taxes.debit_card',
        text: 'setado para taxa do Cartão de Debito',
        typeDB: 'payments'
      })
    }
    if (taxaCardCredit !== undefined) {
      await Database.set({
        interaction,
        data: taxaCardCredit,
        pathDB: 'config.taxes.credit_card',
        text: 'setado para taxa do Cartão de Crédito',
        typeDB: 'payments'
      })
    }
  }
}
