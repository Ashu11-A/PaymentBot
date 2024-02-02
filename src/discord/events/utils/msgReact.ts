import { Event } from '@/discord/base'

export default new Event({
  name: 'messageCreate',
  async run (interaction) {
    try {
      const { channelId, id } = interaction
      if (channelId === '1151625495964827759' || channelId === '1145022210826838077') {
        await interaction.react('👍')
          .then(() => {
            console.log(`Mensagem 👍 foi adicionada a mensagem na mensagem ${id} no canal ${channelId}`)
          })
      }
    } catch (err) {
      console.log(err)
    }
  }
})
