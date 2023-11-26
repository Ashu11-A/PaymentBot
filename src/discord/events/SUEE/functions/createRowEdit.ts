// Sistema Unificado de Edição de Embeds (SUEE)

import { db } from '@/app'
import { CustomButtonBuilder } from '@/functions'
import { ActionRowBuilder, type ButtonBuilder, ButtonStyle, type ButtonInteraction, type CacheType, type CommandInteraction, type Message, type ModalSubmitInteraction, type StringSelectMenuInteraction } from 'discord.js'

export async function createRowEdit (interaction: StringSelectMenuInteraction<CacheType> | CommandInteraction<'cached'> | ModalSubmitInteraction<CacheType> | ButtonInteraction<CacheType> | CommandInteraction<CacheType>, message: Message<boolean>, type: string): Promise<ActionRowBuilder<ButtonBuilder>> {
  const { guildId, channelId } = interaction
  const data = await db.messages.get(`${guildId}.${type}.${channelId}.messages.${message.id}`)

  const rowButtons = [
    await CustomButtonBuilder.create({
      customId: `${type}_SetName`,
      label: 'Nome',
      emoji: '📝'
    }),
    await CustomButtonBuilder.create({
      customId: `${type}_SetDesc`,
      label: 'Descrição',
      emoji: '📑'
    }),
    await CustomButtonBuilder.create({
      customId: `${type}_SetMiniature`,
      label: 'Miniatura',
      emoji: '🖼️'
    }),
    await CustomButtonBuilder.create({
      customId: `${type}_SetBanner`,
      label: 'Banner',
      emoji: '🌄'
    }),
    await CustomButtonBuilder.create({
      customId: `${type}_SetColor`,
      label: 'Cor',
      emoji: '🎨'
    })
  ]
  let componetUpdate: string = ''
  for (const value of rowButtons) {
    const { custom_id: customID } = Object(value.toJSON())
    if (data?.properties !== undefined && data?.properties[customID] !== undefined) {
      value.setStyle(ButtonStyle.Primary)
    } else {
      value.setStyle(ButtonStyle.Secondary)
    }
    componetUpdate += (customID + ' ')
  }
  console.log('Atualizando os componentes: ', componetUpdate)
  return new ActionRowBuilder<ButtonBuilder>().addComponents(...rowButtons)
}
