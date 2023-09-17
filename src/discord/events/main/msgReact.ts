import { Event } from '@/discord/base'

export default new Event({
  name: 'messageCreate',
  async run (interaction) {
    try {
      const { channelId } = interaction
      if (channelId === '1145021920899780689' || channelId === '1145022210826838077') {
        await interaction.react('👍')
      }
    } catch (err) {
      console.log(err)
    }
  }
})
