// Sistema Unificado de Edição de Embeds (SUEE)

import { db } from '@/app'
import { CustomButtonBuilder } from '@/functions'
import { ActionRowBuilder, type ButtonBuilder, ButtonStyle, type ButtonInteraction, type CommandInteraction, type Message, type ModalSubmitInteraction, type StringSelectMenuInteraction, type CacheType } from 'discord.js'

export async function createRowEdit (interaction: StringSelectMenuInteraction<CacheType> | CommandInteraction<'cached'> | ModalSubmitInteraction<CacheType> | ButtonInteraction<CacheType> | CommandInteraction<CacheType>, message: Message<boolean>, type: 'ticket' | 'payments'): Promise<ActionRowBuilder<ButtonBuilder>> {
  const { guildId, channelId } = interaction
  const data = await db.messages.get(`${guildId}.${type}.${channelId}.messages.${message.id}`)

  const rowButtons = [
    await CustomButtonBuilder.create({
      permission: 'Admin',
      type: 'SUEE',
      customId: `${type}-SetName`,
      label: 'Nome',
      emoji: '📝'
    }),
    await CustomButtonBuilder.create({
      permission: 'Admin',
      type: 'SUEE',
      customId: `${type}-SetDesc`,
      label: 'Descrição',
      emoji: '📑'
    }),
    await CustomButtonBuilder.create({
      permission: 'Admin',
      type: 'SUEE',
      customId: `${type}-SetMiniature`,
      label: 'Miniatura',
      emoji: '🖼️'
    }),
    await CustomButtonBuilder.create({
      permission: 'Admin',
      type: 'SUEE',
      customId: `${type}-SetBanner`,
      label: 'Banner',
      emoji: '🌄'
    }),
    await CustomButtonBuilder.create({
      permission: 'Admin',
      type: 'SUEE',
      customId: `${type}-SetColor`,
      label: 'Cor',
      emoji: '🎨'
    })
  ]
  let componetUpdate: string = ''
  for (const value of rowButtons) {
    const { customId } = value

    if (data?.properties !== undefined && data?.properties[customId] !== undefined) {
      value.setStyle(ButtonStyle.Primary)
    } else {
      value.setStyle(ButtonStyle.Secondary)
    }
    componetUpdate += (customId + ' ')
  }
  console.log('Atualizando os componentes: ', componetUpdate)
  return new ActionRowBuilder<ButtonBuilder>().addComponents(...rowButtons)
}
