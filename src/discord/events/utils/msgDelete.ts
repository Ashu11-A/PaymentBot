import { Event } from '@/discord/base'

new Event({
  name: 'interactionCreate',
  async run (interaction) {
    if (!interaction.isButton()) return
    const { customId, message } = interaction
    if (customId === 'deleteMsg') {
      await message.delete()
    }
  }
})
