import { log } from '@/settings'
import ck from 'chalk'
import {
  type ApplicationCommandData,
  type ApplicationCommandType,
  type AutocompleteInteraction,
  type ChatInputCommandInteraction,
  Collection, type CommandInteraction,
  type MessageContextMenuCommandInteraction,
  type UserContextMenuCommandInteraction
} from 'discord.js'

type C<B extends boolean, I extends CommandInteraction | AutocompleteInteraction> =
I extends ChatInputCommandInteraction
  ? B extends false ? ChatInputCommandInteraction<'cached'> : ChatInputCommandInteraction
  : I extends UserContextMenuCommandInteraction
    ? B extends false ? UserContextMenuCommandInteraction<'cached'> : UserContextMenuCommandInteraction
    : I extends MessageContextMenuCommandInteraction
      ? B extends false ? MessageContextMenuCommandInteraction<'cached'> : MessageContextMenuCommandInteraction
      : I extends AutocompleteInteraction
        ? B extends false ? AutocompleteInteraction<'cached'> : AutocompleteInteraction
        : never

type CommandProps<DmPermission extends boolean> =
{
  type: ApplicationCommandType.ChatInput
  autoComplete?: (interaction: C<DmPermission, AutocompleteInteraction>) => any
  run: (interaction: C<DmPermission, ChatInputCommandInteraction>,) => any
} | {
  type: ApplicationCommandType.User
  run: (interaction: C<DmPermission, UserContextMenuCommandInteraction>) => any
} | {
  type: ApplicationCommandType.Message
  run: (interaction: C<DmPermission, MessageContextMenuCommandInteraction>) => any
}

type CommandData<DmPermission extends boolean> = CommandProps<DmPermission> & ApplicationCommandData & {
  dmPermission: DmPermission
}

export class Command<DmPermission extends boolean = boolean> {
  public static all = new Collection<string, CommandData<boolean>>()
  constructor (public data: CommandData<DmPermission>) {
    log.successComamnd(ck.green(`${ck.cyan.underline(data.name)} has been successfully registered!`))
    Command.all.set(data.name, data)
  }
}
