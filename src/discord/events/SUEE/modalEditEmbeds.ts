// Sistema Unificado de Edição de Embeds (SUEE)

import { core, db } from '@/app'
import { updateProduct } from '@/discord/components/payments'
import { ticketButtonsConfig } from '@/discord/components/tickets'
import { Event } from '@/discord/base'
import { validarCorHex } from '@/functions'

const buttonsModals: Record<string, { type: string }> = {
  SetName: {
    type: 'embed.title'
  },
  SetDesc: {
    type: 'embed.description'
  },
  SetMiniature: {
    type: 'embed.thumbnail.url'
  },
  SetBanner: {
    type: 'embed.image.url'
  },
  SetColor: {
    type: 'embed.color'
  }
}

export default new Event({
  name: 'interactionCreate',
  async run (interaction) {
    if (!interaction.isModalSubmit()) return
    if (!interaction.isFromMessage()) return
    const start = Date.now()
    const { customId, guildId, channelId, message, fields } = interaction

    const getTypeFromCustomId = (customId: string): string[] | null[] => {
      const parts = customId.split('_')
      if (parts.length === 2) {
        return [parts[0], parts[1]]
      }
      return [null, null]
    }

    const [type, button] = getTypeFromCustomId(customId)

    if (type !== null && button !== null && button in buttonsModals) {
      try {
        await interaction.deferReply({ ephemeral: true })

        const { type: modalType } = buttonsModals[button]
        let messageModal = fields.getTextInputValue('content')

        if (messageModal.toLowerCase() === 'vazio') {
          messageModal = ''
        }

        if (button === 'SetColor') {
          const [validador, message] = validarCorHex(messageModal)
          if (!validador) {
            await interaction.editReply({ content: message })
            return
          }
        }

        await db.messages.set(`${guildId}.${type}.${channelId}.messages.${message?.id}.${modalType}`, messageModal)
        await db.messages.set(`${guildId}.${type}.${channelId}.messages.${message?.id}.properties.${customId}`, true)
        if (type === 'ticket') {
          await ticketButtonsConfig(interaction, message)
        } else if (type === 'payments') {
          await updateProduct.embed({
            interaction,
            message,
            button
          })
        }
        await interaction.editReply({ content: '✅ | Elemento ' + '`' + customId + '`' + ' foi alterado com sucesso!' })
      } catch (err) {
        console.log(err)
        await interaction.editReply({ content: '❌ | Ocorreu um erro!' })
      }
      const end = Date.now()
      const timeSpent = (end - start) / 1000 + 's'
      core.info(`Botão | ${button} | ${timeSpent}`)
    }
  }
})
