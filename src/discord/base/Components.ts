import { core } from '@/app'
import ck from 'chalk'
import { type ButtonInteraction, type CacheType, type ChannelSelectMenuInteraction, type MentionableSelectMenuInteraction, type ModalSubmitInteraction, type RoleSelectMenuInteraction, type StringSelectMenuInteraction, type UserSelectMenuInteraction } from 'discord.js'

type ComponentProps<Cached extends CacheType = CacheType> = {
  type: 'Button'
  run: (interaction: ButtonInteraction<Cached>) => any
} | {
  type: 'StringSelect'
  run: (interaction: StringSelectMenuInteraction<Cached>) => any
} | {
  type: 'RoleSelect'
  run: (interaction: RoleSelectMenuInteraction<Cached>) => any
} | {
  type: 'ChannelSelect'
  run: (interaction: ChannelSelectMenuInteraction<Cached>) => any
} | {
  type: 'UserSelect'
  run: (interaction: UserSelectMenuInteraction<Cached>) => any
} | {
  type: 'MentionableSelect'
  run: (interaction: MentionableSelectMenuInteraction<Cached>) => any
} | {
  type: 'Modal'
  run: (interaction: ModalSubmitInteraction<Cached>) => any
}

type ComponentData<Cached extends CacheType = CacheType> = ComponentProps<Cached> & {
  cache?: Cached
  customId: string
}

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class Component {
  public static all: Array<ComponentData<any>> = []

  public static find<Cached extends CacheType, T extends ComponentData<Cached>['type']>(
    customId: string,
    type: T
  ): ComponentData<Cached> & { type: T } | undefined {
    const c = Component.all.find((component) => component.customId === customId && component.type === type)
    return c as ComponentData<Cached> & { type: T } | undefined
  }

  constructor (data: ComponentData<any>) {
    core.info(ck.green(`${ck.cyan.underline(data.customId)} has been successfully saved!`))
    Component.all.push(data)
  }
}
