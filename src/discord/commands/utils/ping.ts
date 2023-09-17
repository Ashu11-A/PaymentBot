import { Command } from '@/discord/base'
import { ApplicationCommandType, EmbedBuilder } from 'discord.js'

new Command({
  name: 'ping',
  description: '[ 🪄 Utilidades ] Mostra o ping do bot',
  dmPermission,
  type: ApplicationCommandType.ChatInput,
  async run (interaction) {
    const { client } = interaction
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
