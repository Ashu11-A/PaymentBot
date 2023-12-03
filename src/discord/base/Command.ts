import { core } from '@/app'
import ck from 'chalk'
import {
  type ApplicationCommandData,
  type ApplicationCommandType,
  type AutocompleteInteraction,
  type ChatInputCommandInteraction,
  Collection, type CommandInteraction,
  type MessageContextMenuCommandInteraction,
  type UserContextMenuCommandInteraction,
  type CacheType
} from 'discord.js'

type C<B extends boolean, I extends CommandInteraction | AutocompleteInteraction> =
I extends ChatInputCommandInteraction
  ? B extends false ? ChatInputCommandInteraction<CacheType> : ChatInputCommandInteraction
  : I extends UserContextMenuCommandInteraction
    ? B extends false ? UserContextMenuCommandInteraction<CacheType> : UserContextMenuCommandInteraction
    : I extends MessageContextMenuCommandInteraction
      ? B extends false ? MessageContextMenuCommandInteraction<CacheType> : MessageContextMenuCommandInteraction
      : I extends AutocompleteInteraction
        ? B extends false ? AutocompleteInteraction<CacheType> : AutocompleteInteraction
        : never

type CommandProps<DmPermission extends boolean> =
{
  type: ApplicationCommandType.ChatInput
  autoComplete?: (interaction: C<DmPermission, AutocompleteInteraction>) => any
  run: (interaction: C<DmPermission, ChatInputCommandInteraction>) => any
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
    core.info(ck.green(`${ck.cyan.underline(data.name)} has been successfully registered!`))
    Command.all.set(data.name, data)
  }
}
