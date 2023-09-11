import { type AnyComponentBuilder, ActionRowBuilder } from 'discord.js'

export function createRow<Component extends AnyComponentBuilder = AnyComponentBuilder> (...components: Component[]): any {
  return new ActionRowBuilder<Component>({ components })
}
