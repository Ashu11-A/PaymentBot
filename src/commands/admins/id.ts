import { Command } from '@/structs/types/Command'
import { ApplicationCommandOptionType, ApplicationCommandType, EmbedBuilder } from 'discord.js'

export default new Command({
  name: 'id',
  description: '[ 🆔 ] Pega o id de algo',
  descriptionLocalizations: {
    'en-US': '[ 🆔 ] Get the id of something'
  },
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'usuário',
      description: 'Escolha usuário que gostaria de saber o ID.',
      nameLocalizations: {
        'en-US': 'user'
      },
      descriptionLocalizations: {
        'en-US': 'Choose the user you would like to know the ID of.'
      },
      type: ApplicationCommandOptionType.User
    },
    {
      name: 'cargo',
      description: 'Escolha o cargo que gostaria de saber o ID.',
      nameLocalizations: {
        'en-US': 'role'
      },
      descriptionLocalizations: {
        'en-US': 'Choose the role you would like to know the ID of.'
      },
      type: ApplicationCommandOptionType.Role
    },
    {
      name: 'canal',
      description: 'Escolha o canal que gostaria de saber o ID.',
      nameLocalizations: {
        'en-US': 'channel'
      },
      descriptionLocalizations: {
        'en-US': 'Choose the channel you would like to know the ID of.'
      },
      type: ApplicationCommandOptionType.Channel
    }
  ],
  async run ({ interaction, options }) {
    await interaction.deferReply({ ephemeral: true })

    const user = options.getUser('usuário')
    const cargo = options.getRole('cargo')
    const canal = options.getChannel('canal')

    if (user !== null || cargo !== null || canal !== null) {
      const embed = new EmbedBuilder()
        .setColor('Green')
        .setTitle(`Olá, ${interaction.user.username}!`)
        .setDescription('O resultado da sua consulta se encontra abaixo:')

      if (user !== null) {
        embed.addFields({
          name: `User: ${user?.username}`,
          value: 'ID: ' + '```' + user.id + '```'
        })
      }

      if (cargo !== null) {
        embed.addFields({
          name: `Role: ${cargo?.name}`,
          value: 'ID: ' + '```' + cargo.id + '```'
        })
      }

      if (canal !== null) {
        embed.addFields({
          name: `Channel: ${canal?.name}`,
          value: 'ID: ' + '```' + canal.id + '```'
        })
      }

      await interaction.editReply({
        embeds: [embed]
      })
    } else {
      await interaction.editReply({ message: 'Nenhuma opção foi expecificada...' })
    }
  }
})
