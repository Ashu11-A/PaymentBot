import { type ApplicationCommandData, type AutocompleteInteraction, type ButtonInteraction, type Collection, type CommandInteraction, type CommandInteractionOptionResolver, type ModalSubmitInteraction, type StringSelectMenuInteraction } from 'discord.js'
import { type ExtendedClient } from '../ExtendedClient'

interface CommandProps {
  client: ExtendedClient
  interaction: CommandInteraction
  options: CommandInteractionOptionResolver
}

export type ComponentsButton = Collection<string, (interaction: ButtonInteraction) => any>
export type ComponentsSelect = Collection<string, (interaction: StringSelectMenuInteraction) => any>
export type ComponentsModal = Collection<string, (interaction: ModalSubmitInteraction) => any>

interface CommandComponents {
  buttons?: ComponentsButton
  selects?: ComponentsSelect
  modals?: ComponentsModal
}

export type CommandType = ApplicationCommandData & CommandComponents & {
  run: (props: CommandProps) => any
  autoComplete?: (interaction: AutocompleteInteraction) => any
}

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class Command {
  constructor (options: CommandType) {
    options.dmPermission = false
    Object.assign(this, options)
  }
}
