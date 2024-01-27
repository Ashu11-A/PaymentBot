import { Command } from '@/discord/base'
import { ApplicationCommandType } from 'discord.js'

new Command({
  name: 'logar',
  nameLocalizations: {
    'en-GB': 'login'
  },
  description: '[ 🧑 Perfil] Login',
  dmPermission,
  type: ApplicationCommandType.ChatInput,
  run (interaction) {

  }
})
