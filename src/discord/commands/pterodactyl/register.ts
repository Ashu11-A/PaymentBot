import { Command } from '@/discord/base'
import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord.js'

new Command({
  name: 'registro',
  nameLocalizations: {
    'en-US': 'register'
  },
  description: '[ 🦖 Pterodactyl] Registro',
  descriptionLocalizations: {
    'en-GB': '[ 🦖 Pterodactyl] Register'
  },
  dmPermission,
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'email',
      description: 'Email para acesso ao Painel',
      type: ApplicationCommandOptionType.String,
      required: true
    },
    {
      name: 'username',
      description: 'Nome de Usuário',
      type: ApplicationCommandOptionType.String,
      required: true
    },
    {
      name: 'primeiro-nome',
      description: 'Será usado para os registro de pagamentos!',
      type: ApplicationCommandOptionType.String,
      required: true
    },
    {
      name: 'último-nome',
      description: 'Será usado para os registro de pagamentos!',
      type: ApplicationCommandOptionType.String,
      required: true
    }
  ],
  run (interaction) {
    if (!interaction.inCachedGuild()) return
    const { options } = interaction
    console.log(options)
  }
})
