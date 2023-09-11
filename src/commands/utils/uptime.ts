import { Command } from '@/structs/types/Command'
import { ApplicationCommandType, EmbedBuilder } from 'discord.js'

export default new Command({
  name: 'uptime',
  description: '[ 🪄 Utilidades ] Mostra o tempo de execução do bot',
  type: ApplicationCommandType.ChatInput,
  async run ({ interaction }) {
    await interaction.deferReply({ ephemeral: true })
    const embed = new EmbedBuilder()
      .setColor('Green')
      .setTitle('Uptime do Bot')
      .addFields(
        {
          name: 'Tempo Ativo:',
          value: `<t:${~~((Date.now() - interaction.client.uptime) / 1000)}> (<t:${~~((Date.now() - interaction.client.uptime) / 1000)}:R>)`
        }
      )
    await interaction.editReply({ embeds: [embed] })
  }
})
