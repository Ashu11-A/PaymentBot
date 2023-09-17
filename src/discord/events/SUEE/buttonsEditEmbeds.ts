// Sistema Unificado de Edição de Embeds (SUEE)

import { db } from '@/app'
import { Event } from '@/discord/base'
import { ModalBuilder, ActionRowBuilder, TextInputBuilder } from 'discord.js'

const buttonsModals: any = {
  SetName: {
    button: true,
    modal: true,
    title: '❓| Qual será o Título da Embed?',
    label: 'Título da embed',
    placeholder: 'Ex: Pegue seu embed!',
    style: 1,
    maxLength: 256,
    type: 'embed.title'
  },
  SetDesc: {
    button: true,
    modal: true,
    title: '❓| Qual será a Descrição da Embed?',
    label: 'Descrição do produto',
    placeholder: 'Ex: Basta abrir seu embed e aguardar um membro dê nossa equipe para lhe ajudar.',
    style: 2,
    maxLength: 4000,
    type: 'embed.description'
  },
  SetMiniature: {
    button: true,
    modal: true,
    title: '❓| Qual será a Miniatura da Embed?',
    label: 'Coloque um Link, ou digite "VAZIO"',
    placeholder: 'Ex: https://uma.imagemBem.ilustrativa/img.png',
    style: 1,
    maxLength: 4000,
    type: 'embed.thumbnail.url'
  },
  SetBanner: {
    button: true,
    modal: true,
    title: '❓| Qual será o Banner da Embed?',
    label: 'Coloque um Link, ou digite "VAZIO"',
    placeholder: 'Ex: https://um.bannerBem.legal/img.png',
    style: 1,
    maxLength: 4000,
    type: 'embed.image.url'
  },
  SetColor: {
    button: true,
    modal: true,
    title: '❓| Qual será a Cor da Embed?',
    label: 'Cor em hexadecimal',
    placeholder: 'Ex: #13fc03',
    style: 1,
    maxLength: 7,
    type: 'embed.color'
  }
}

export default new Event({
  name: 'interactionCreate',
  async run (interaction) {
    if (!interaction.isButton()) return
    const { customId, message, guildId, channelId } = interaction

    console.log(customId)

    const getTypeFromCustomId = (customId: string): string[] | null[] => {
      const parts = customId.split('_')
      if (parts.length === 2) {
        return [parts[0], parts[1]]
      }
      return [null, null]
    }

    const [type, button] = getTypeFromCustomId(customId)

    console.log(type)

    if (type !== null && button !== null && button in buttonsModals) {
      const { title, label, placeholder, style, maxLength, type: modalType } = buttonsModals[button]

      const textValue = await db.messages.get(`${guildId}.${type}.${channelId}.messages.${message.id}.${modalType}`)
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
})
