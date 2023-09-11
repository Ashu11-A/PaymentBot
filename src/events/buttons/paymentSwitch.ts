import { db } from '@/app'
import { buttonsConfig, buttonsUsers } from '@/commands/payments/utils/buttons'
import { Event } from '@/structs/types/Event'

export default new Event({
  name: 'interactionCreate',
  async run (interaction) {
    if (!interaction.isButton()) return
    const { customId, message, guildId, channelId } = interaction
    if (customId === 'paymentSave' || customId === 'paymentConfig' || customId === 'paymentStatus') {
      if ((interaction?.memberPermissions?.has('Administrator')) === false) {
        await interaction.reply({
          content: '**❌ - Você não possui permissão para utilizar este botão.**',
          ephemeral: true
        })
        return
      }

      if (customId === 'paymentSave') {
        await interaction.reply({ content: '⏱️ | Aguarde só um pouco...', ephemeral: true })
        await buttonsUsers(interaction, message)
      } else if (customId === 'paymentConfig') {
        await interaction.reply({ content: '⏱️ | Aguarde só um pouco...', ephemeral: true })
        await buttonsConfig(interaction, message)
      } else if (customId === 'paymentStatus') {
        await interaction.reply({ content: '⏱️ | Aguarde só um pouco...', ephemeral: true })

        let status = await db.payments.get(`${guildId}.channels.${channelId}.messages.${message.id}.status`)
        if (status === undefined || status === false) {
          status = true
        } else {
          status = false
        }

        await db.payments.set(`${guildId}.channels.${channelId}.messages.${message.id}.status`, status)
        await buttonsConfig(interaction, message)
      }
    }
  }
})
