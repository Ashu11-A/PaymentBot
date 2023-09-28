// Sistema Unificado de Edição de Embeds (SUEE)

import { db } from '@/app'
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, type Message, type CommandInteraction, type CacheType, type ModalSubmitInteraction, type ButtonInteraction, type StringSelectMenuInteraction } from 'discord.js'

export async function createRowEdit (interaction: StringSelectMenuInteraction<CacheType> | CommandInteraction<'cached'> | ModalSubmitInteraction<CacheType> | ButtonInteraction<CacheType> | CommandInteraction<CacheType>, message: Message<boolean>, type: string): Promise<Array<ActionRowBuilder<ButtonBuilder>>> {
  const { guildId, channelId } = interaction
  const data = await db.messages.get(`${guildId}.${type}.${channelId}.messages.${message.id}`)

  const rowButtons = [
    new ButtonBuilder()
      .setCustomId(`${type}_SetName`)
      .setLabel('Nome')
      .setEmoji('📝'),
    new ButtonBuilder()
      .setCustomId(`${type}_SetDesc`)
      .setLabel('Descrição')
      .setEmoji('📑'),
    new ButtonBuilder()
      .setCustomId(`${type}_SetMiniature`)
      .setLabel('Miniatura')
      .setEmoji('🖼️'),
    new ButtonBuilder()
      .setCustomId(`${type}_SetBanner`)
      .setLabel('Banner')
      .setEmoji('🌄'),
    new ButtonBuilder()
      .setCustomId(`${type}_SetColor`)
      .setLabel('Cor')
      .setEmoji('🎨')
  ]

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(...rowButtons)

  for (const value of rowButtons) {
    const { custom_id: customID } = Object(value.toJSON())
    if (data?.properties !== undefined && data?.properties[customID] !== undefined) {
      value.setStyle(ButtonStyle.Primary)
    } else {
      value.setStyle(ButtonStyle.Secondary)
    }
  }

  return [row]
}
