import { type CommandInteractionOptionResolver } from 'discord.js'
import { client } from '@/app'
import { Event } from '@/structs/types/Event'

export default new Event({
  name: 'interactionCreate',
  run (interaction) {
    if (!interaction.isCommand()) return
    const command = client.commands.get(interaction.commandName)
    if (command == null) return

    if (interaction.isAutocomplete() && (command.autoComplete != null)) {
      command.autoComplete(interaction)
      return
    }

    if (interaction.isChatInputCommand()) {
      const options = interaction.options as CommandInteractionOptionResolver
      command.run({ client, interaction, options })
    }
  }
})
