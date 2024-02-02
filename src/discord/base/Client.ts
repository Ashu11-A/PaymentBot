import { log, processEnv } from '@/settings'
import ck from 'chalk'
import { ApplicationCommandType, type AutocompleteInteraction, type BitFieldResolvable, type ChatInputCommandInteraction, Client, type ClientOptions, type CommandInteraction, type GatewayIntentsString, IntentsBitField, type MessageContextMenuCommandInteraction, Partials, type UserContextMenuCommandInteraction, version } from 'discord.js'
import { glob } from 'glob'
import { join } from 'path'
import { Command, Component, Event } from '.'
import { core } from '@/app'

export function createClient (options?: ClientOptions): Client {
  const client = new Client({
    intents: Object.keys(IntentsBitField.Flags) as BitFieldResolvable<GatewayIntentsString, number>,
    partials: [Partials.Channel, Partials.GuildMember, Partials.Message, Partials.User, Partials.ThreadMember],
    failIfNotExists: false,
    ...options
  })
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  client.start = async function () {
    const discordDir = join(__dirname, '..')
    const paths = await glob([
      'commands/**/*.{ts,js}',
      'events/**/*.{ts,js}',
      'components/**/*.{ts,js}'
    ], { cwd: discordDir })
    for (const path of paths) await import(join(discordDir, path))
    Event.all.forEach(({ run, name, once }) => (once ?? false)
      ? this.once(name, run)
      : this.on(name, run)
    )
    void this.login(processEnv.BOT_TOKEN)
  }

  client.on('interactionCreate', interaction => {
    const onAutoComplete = (autoCompleteInteraction: AutocompleteInteraction): void => {
      const command = Command.all.get(autoCompleteInteraction.commandName)
      const interaction = autoCompleteInteraction
      if (command?.type === ApplicationCommandType.ChatInput && (command.autoComplete !== undefined)) {
        command.autoComplete(interaction)
      }
    }
    const onCommand = (commandInteraction: CommandInteraction): void => {
      const command = Command.all.get(commandInteraction.commandName)

      switch (command?.type) {
        case ApplicationCommandType.ChatInput:{
          const interaction = commandInteraction as ChatInputCommandInteraction
          command.run(interaction)
          return
        }
        case ApplicationCommandType.Message:{
          const interaction = commandInteraction as MessageContextMenuCommandInteraction
          command.run(interaction)
          return
        }
        case ApplicationCommandType.User:{
          const interaction = commandInteraction as UserContextMenuCommandInteraction
          command.run(interaction)
        }
      }
    }
    if (interaction.isCommand()) onCommand(interaction)
    if (interaction.isAutocomplete()) onAutoComplete(interaction)

    if (!interaction.isModalSubmit() && !interaction.isMessageComponent()) return

    if (interaction.isModalSubmit()) {
      const component = Component.find(interaction.customId, 'Modal')
      component?.run(interaction); return
    }
    if (interaction.isButton()) {
      const component = Component.find(interaction.customId, 'Button')
      component?.run(interaction); return
    }
    if (interaction.isStringSelectMenu()) {
      const component = Component.find(interaction.customId, 'StringSelect')
      component?.run(interaction); return
    }
    if (interaction.isChannelSelectMenu()) {
      const component = Component.find(interaction.customId, 'ChannelSelect')
      component?.run(interaction); return
    }
    if (interaction.isRoleSelectMenu()) {
      const component = Component.find(interaction.customId, 'RoleSelect')
      component?.run(interaction); return
    }
    if (interaction.isUserSelectMenu()) {
      const component = Component.find(interaction.customId, 'UserSelect')
      component?.run(interaction); return
    }
    if (interaction.isMentionableSelectMenu()) {
      const component = Component.find(interaction.customId, 'MentionableSelect')
      component?.run(interaction)
    }
  })
  client.once('ready', async client => {
    console.log()
    core.info(`${ck.green('Bot online')} ${ck.blue.underline('discord.js')} 📦 ${ck.yellow(version)}`)
    core.info(`${ck.greenBright(`➝ Connected with ${ck.underline(client.user.username)}`)}`)
    console.log()

    await client.application.commands.set(Array.from(Command.all.values()))
      .then((c) => { core.info(ck.green('Commands defined successfully!')) })
      .catch(log.error)
  })
  return client
}
