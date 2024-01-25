import { Database } from '@/functions'
import { type ModalSubmitInteraction, type CacheType } from 'discord.js'

export async function mcConfig (options: {
  interaction: ModalSubmitInteraction<CacheType>
}): Promise<void> {
  const { interaction } = options
  const { fields } = interaction

  if (!interaction.inGuild()) return
  await interaction.deferReply({ ephemeral })

  const token = fields.getTextInputValue('token')
  const ipnURL = fields.getTextInputValue('ipn')
  const taxaPix = fields.getTextInputValue('taxaPix')
  const taxaCardDebit = fields.getTextInputValue('taxaCardDebit')
  const taxaCardCredit = fields.getTextInputValue('taxaCardCredit')

  if (token !== undefined && token !== '') {
    await new Database({ interaction, pathDB: 'config.mcToken', typeDB: 'payments' }).set({
      data: token,
      text: 'setado para autenticação'
    })
  }

  if (ipnURL !== undefined) {
    await new Database({ interaction, pathDB: 'config.ipn', typeDB: 'payments' }).set({
      data: ipnURL
    })
  }

  if (taxaPix !== undefined) {
    await new Database({ interaction, pathDB: 'config.taxes.pix', typeDB: 'payments' }).set({
      data: taxaPix,
      text: 'setado para taxa do Pix'
    })
  }
  if (taxaCardDebit !== undefined) {
    await new Database({ interaction, pathDB: 'config.taxes.debit_card', typeDB: 'payments' }).set({
      data: taxaCardDebit,
      text: 'setado para taxa do Cartão de Debito'
    })
  }
  if (taxaCardCredit !== undefined) {
    await new Database({ interaction, pathDB: 'config.taxes.credit_card', typeDB: 'payments' }).set({
      data: taxaCardCredit,
      text: 'setado para taxa do Cartão de Crédito'
    })
  }
}
