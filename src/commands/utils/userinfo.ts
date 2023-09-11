import { Command } from '@/structs/types/Command'
import { ApplicationCommandOptionType } from 'discord.js'

import userInfo from './embeds/userInfo'

export default new Command({
  name: 'userinfo',
  description: '[ 🪄 Utilidades ] Exibe informações do usuário.',
  options: [
    {
      name: 'usuário',
      description: 'O usuário sobre o qual você deseja obter informações.',
      type: ApplicationCommandOptionType.User
    }
  ],
  async run ({ interaction, options }) {
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
