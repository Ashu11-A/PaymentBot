import { Command } from '@/discord/base'
import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord.js'

import userInfo from './embeds/userInfo'

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
    const member = (options.getMember('usuário') != null) || interaction.member
    const embed = userInfo(member)

    try {
      await interaction.reply({ embeds: [embed] })
    } catch (error) {
      console.error(error)
      await interaction.reply({
        content: 'Ocorreu um erro ao executar este comando.',
        ephemeral: true
      })
    }
  }
})
