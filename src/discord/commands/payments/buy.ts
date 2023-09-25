import { Command } from '@/discord/base'
import { ApplicationCommandType } from 'discord.js'

new Command({
  name: 'comprar',
  nameLocalizations:
    {
      'en-US': 'buy'
    },
  description: '[ 🛒 Pagamentos ] Comprar um determinado valor',
  dmPermission,
  type: ApplicationCommandType.ChatInput,
  async run (interaction) {
    await interaction.reply({ content: 'Olá', ephemeral: true })
  }
})
