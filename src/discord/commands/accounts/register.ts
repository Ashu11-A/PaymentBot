import { Command } from '@/discord/base'
import { GenAccount } from '@/discord/components/account/functions/generate'
import { ApplicationCommandType } from 'discord.js'

new Command({
  name: 'registro',
  nameLocalizations: {
    'en-US': 'register'
  },
  description: '[ 🧑 Perfil] Registro',
  descriptionLocalizations: {
    'en-GB': '[ 🧑 Perfil] Register'
  },
  dmPermission,
  type: ApplicationCommandType.ChatInput,
  async run (interaction) {
    if (!interaction.inCachedGuild()) return
    await interaction.deferReply({ ephemeral })

    const Account = new GenAccount({ interaction })
    await Account.genRegister()
  }
})
