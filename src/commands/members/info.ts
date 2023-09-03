import { config } from '@/app'
import { Command } from '@/structs/types/Command'
import { ApplicationCommandType, EmbedBuilder } from 'discord.js'

export default new Command({
  name: 'info',
  description: '[ 🪄 Utilidades ] Mostra informações sobre o servidor',
  type: ApplicationCommandType.ChatInput,
  async run ({ interaction }) {
    const embed = new EmbedBuilder()
      .setColor('Blurple')
      .setTitle(`Essas são as informações da ${interaction.guild?.name}`)
      .addFields(
        { name: 'Dono', value: `<@${config.Slash.Info.Owner}>` },
        { name: 'ID', value: interaction.channelId },
        {
          name: 'Número de membros',
          value: String(interaction.guild?.memberCount)
        },
        {
          name: 'Site',
          value: config.URLs.Site,
          inline: true
        },
        {
          name: 'Loja',
          value: config.URLs.Loja,
          inline: true
        },
        {
          name: 'Grupo Criado',
          value: String(
            interaction.guild?.createdAt.toLocaleDateString('pt-BR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })
          )
        }
      )
    await interaction.reply({
      ephemeral: true,
      embeds: [embed]
    })
  }
})
