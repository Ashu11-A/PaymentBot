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
      type: 'SSUE',
      customId: `${type}-SetName`,
      label: 'Nome',
      emoji: '📝'
    }),
    await CustomButtonBuilder.create({
      permission: 'Admin',
      type: 'SSUE',
      customId: `${type}-SetDesc`,
      label: 'Descrição',
      emoji: '📑'
    }),
    await CustomButtonBuilder.create({
      permission: 'Admin',
      type: 'SSUE',
      customId: `${type}-SetMiniature`,
      label: 'Miniatura',
      emoji: '🖼️'
    }),
    await CustomButtonBuilder.create({
      permission: 'Admin',
      type: 'SSUE',
      customId: `${type}-SetBanner`,
      label: 'Banner',
      emoji: '🌄'
    }),
    await CustomButtonBuilder.create({
      permission: 'Admin',
      type: 'SSUE',
      customId: `${type}-SetColor`,
      label: 'Cor',
      emoji: '🎨'
    })
  ]
  let componetUpdate: string = ''
  for (const value of rowButtons) {
    const { custom_id } = Object(value.toJSON())
    const customID = CustomButtonBuilder.getAction(custom_id)
    console.log('custom_id: ' + custom_id, 'customID: ' + customID)

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
