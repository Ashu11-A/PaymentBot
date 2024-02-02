// Sistema Unificado de Edição de Embeds (SUEE)

import { core, db } from '@/app'
import { CustomButtonBuilder } from '@/functions'
import { ActionRowBuilder, type ButtonBuilder, ButtonStyle, type ButtonInteraction, type CommandInteraction, type Message, type ModalSubmitInteraction, type StringSelectMenuInteraction, type CacheType } from 'discord.js'
import { getTypeAndKey } from './getTypeAndKey'

export async function createRowEdit (interaction: StringSelectMenuInteraction<CacheType> | CommandInteraction<CacheType> | ModalSubmitInteraction<CacheType> | ButtonInteraction<CacheType> | CommandInteraction<CacheType>, message: Message<boolean>, type: 'ticket' | 'payments'): Promise<ActionRowBuilder<ButtonBuilder>> {
  const { guildId, channelId, user } = interaction
  const data = await db.messages.get(`${guildId}.${type}.${channelId}.messages.${message.id}`)

  const rowButtons = [
    await CustomButtonBuilder.create({
      permission: 'Admin',
      type: 'SUEE',
      customId: `${type}-SetName`,
      label: 'Nome',
      emoji: { name: '📝' },
      isProtected: { user }
    }),
    await CustomButtonBuilder.create({
      permission: 'Admin',
      type: 'SUEE',
      customId: `${type}-SetDesc`,
      label: 'Descrição',
      emoji: { name: '📑' },
      isProtected: { user }
    }),
    await CustomButtonBuilder.create({
      permission: 'Admin',
      type: 'SUEE',
      customId: `${type}-SetMiniature`,
      label: 'Miniatura',
      emoji: { name: '🖼️' },
      isProtected: { user }
    }),
    await CustomButtonBuilder.create({
      permission: 'Admin',
      type: 'SUEE',
      customId: `${type}-SetBanner`,
      label: 'Banner',
      emoji: { name: '🌄' },
      isProtected: { user }
    }),
    await CustomButtonBuilder.create({
      permission: 'Admin',
      type: 'SUEE',
      customId: `${type}-SetColor`,
      label: 'Cor',
      emoji: { name: '🎨' },
      isProtected: { user }
    })
  ]
  const componetUpdate: string[] = []
  for (const value of rowButtons) {
    const { customId } = value
    if (customId === undefined) continue
    const [, button] = getTypeAndKey(customId)
    if (data?.properties !== undefined && data?.properties[String(button)] !== undefined) {
      value.setStyle(ButtonStyle.Primary)
    } else {
      value.setStyle(ButtonStyle.Secondary)
    }
    componetUpdate.push(customId)
  }
  core.info(`Atualizando componentes | ${componetUpdate.join(' | ')}`)
  return new ActionRowBuilder<ButtonBuilder>().addComponents(...rowButtons)
}
