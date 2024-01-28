import {
  ActionRowBuilder,
  ComponentType,
  ModalBuilder,
  TextInputBuilder,
  type ButtonInteraction,
  type CacheType
} from 'discord.js'
import { getModalData } from './getModalData'

export async function showModal (options: {
  interaction: ButtonInteraction<CacheType>
  key: string
}): Promise<void> {
  const { interaction, key } = options
  const { customId } = interaction
  const info = getModalData(key)
  const modal = new ModalBuilder({ customId, title: 'Pterodactyl Registro' })

  const contentData = new Array<ActionRowBuilder<TextInputBuilder>>()

  for (const [position, values] of info.entries()) {
    const { label, maxLength, placeholder, style, customId, type } = values
    if (!(contentData[position] instanceof ActionRowBuilder)) {
      contentData[position] = new ActionRowBuilder<TextInputBuilder>()
    }
    contentData[position].addComponents(
      new TextInputBuilder({
        label,
        placeholder,
        style,
        maxLength,
        required: true,
        customId,
        type
      })
    )
  }

  modal.setComponents(contentData)
  await interaction.showModal(modal)
}
