// Sistema Unificado de Edição de Embeds (SUEE)

import { db } from '@/app'
import { ActionRowBuilder, type ButtonInteraction, type CacheType, ModalBuilder, TextInputBuilder } from 'discord.js'
import { getTypeAndKey } from './functions/getTypeAndKey'
import { getModalData } from './functions/getModalData'

export async function collectorEditButtons (options: { interaction: ButtonInteraction<CacheType>, key: string }): Promise<void> {
  const { interaction, key } = options
  const { guildId, channelId, message: { id: messageId }, customId } = interaction

  const [type, button] = getTypeAndKey(key)

  console.log(type, button, key)

  if (type !== null && button !== null) {
    const { title, label, placeholder, style, maxLength, type: modalType } = getModalData(button)
    const textValue = await db.messages.get(`${guildId}.${type}.${channelId}.messages.${messageId}.${modalType}`)
    const modal = new ModalBuilder({ customId, title })
    const content = new ActionRowBuilder<TextInputBuilder>({
      components: [
        new TextInputBuilder({
          custom_id: 'content',
          label,
          placeholder,
          value: textValue ?? null,
          style,
          required: true,
          maxLength
        })
      ]
    })
    modal.setComponents(content)
    await interaction.showModal(modal)
  }
}
