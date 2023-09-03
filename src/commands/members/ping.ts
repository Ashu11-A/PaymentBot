import { Command } from '@/structs/types/Command'
import { ApplicationCommandType, EmbedBuilder } from 'discord.js'

export default new Command({
  name: 'ping',
  description: 'Mostra o ping do bot',
  type: ApplicationCommandType.ChatInput,
  async run ({ interaction, client }) {
    const apiLatency = client.ws.ping
    const botLatency = Date.now() - interaction.createdTimestamp

    const embed = new EmbedBuilder()
      .setTitle('Pong!')
      .setColor('DarkGold')
      .setDescription(`Latencia da API: ${apiLatency}ms \nLatencia do Bot: ${botLatency}ms`)

    await interaction.reply({
      ephemeral: true,
      embeds: [embed]
    })
  }
})
