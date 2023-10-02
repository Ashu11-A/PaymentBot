import { Database } from '@/functions'
import { type ModalSubmitInteraction, type CacheType } from 'discord.js'

export default async function collectorModal (interaction: ModalSubmitInteraction<CacheType>, key: string, value: any): Promise<void> {
  if (!interaction.inGuild()) return

  await interaction.deferReply({ ephemeral })

  const { customId, fields } = interaction
  const messageModal = fields.getTextInputValue('content')
  if (customId === 'mcConfig') {
    await Database.set({
      interaction,
      data: messageModal,
      pathDB: 'payments.mcToken',
      text: 'setado para autenticação'
    })
  }
}
