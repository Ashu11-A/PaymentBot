import { buttonsConfig, buttonsUsers } from '@/commands/payment/utils/buttons'
import { Event } from '@/structs/types/Event'

export default new Event({
  name: 'interactionCreate',
  async run (interaction) {
    if (!interaction.isButton()) return
    const { customId, message } = interaction
    if (customId === 'paymentSave') {
      await interaction.reply({ content: '⏱️ | Aguarde só um pouco...', ephemeral: true })
      await buttonsUsers(interaction, message)
    } else if (customId === 'paymentConfig') {
      await interaction.reply({ content: '⏱️ | Aguarde só um pouco...', ephemeral: true })
      await buttonsConfig(interaction, message)
    }
  }
})
