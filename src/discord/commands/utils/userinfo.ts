import { Command } from '@/discord/base'
import { ApplicationCommandOptionType, ApplicationCommandType, EmbedBuilder } from 'discord.js'

new Command({
  name: 'userinfo',
  description: '[ 🪄 Utilidades ] Exibe informações do usuário.',
  dmPermission,
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'usuário',
      description: 'O usuário sobre o qual você deseja obter informações.',
      type: ApplicationCommandOptionType.User
    }
  ],
  async run (interaction) {
    const { options } = interaction
    const member = options.getMember('usuário') ?? interaction.member
    const user = member.user
    const joinedAt = member.joinedAt?.toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
    const avatarURL = user.avatarURL() ?? ''

    try {
      await interaction.reply({
        embeds: [
          new EmbedBuilder({
            title: 'Informações do usuário',
            fields: [
              { name: 'Nome', value: user.username },
              { name: 'ID', value: user.id },
              {
                name: 'Entrou no servidor em',
                value: joinedAt ?? 'Indefinido'
              },
              {
                name: 'Conta criada em',
                value: user.createdAt.toLocaleDateString('pt-BR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })
              }
            ],
            thumbnail: { url: avatarURL, height: 2048, width: 2048 },
            timestamp: new Date()
          }).setColor('Aqua')
        ]
      })
    } catch (error) {
      console.error(error)
      await interaction.reply({
        content: 'Ocorreu um erro ao executar este comando.',
        ephemeral: true
      })
    }
  }
})
