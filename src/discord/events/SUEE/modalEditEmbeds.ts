// Sistema Unificado de Edição de Embeds (SUEE)

import { db } from '@/app'
import { paymentButtonsConfig } from '@/discord/commands/payments/utils/paymentUpdateConfig'
import { ticketButtonsConfig } from '@/discord/commands/tickets/utils/ticketUpdateConfig'
import { Event } from '@/discord/base'
import { validarCorHex } from '@/functions'

const buttonsModals: any = {
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
    const { customId, guildId, channel, channelId, message, fields } = interaction

    console.log(customId)

    const getTypeFromCustomId = (customId: string): string[] | null[] => {
      const parts = customId.split('_')
      if (parts.length === 2) {
        return [parts[0], parts[1]]
      }
      return [null, null]
    }

    const [type, button] = getTypeFromCustomId(customId)

    if (type !== null && button !== null && button in buttonsModals) {
      await interaction.deferReply({ ephemeral: true })

      const { type: modalType } = buttonsModals[button]
      let messageModal = fields.getTextInputValue('content')
      console.log('type:', type)
      console.log('messageModal:', messageModal)

      if (messageModal.toLowerCase() === 'vazio') {
        messageModal = ''
      }

      if (button === 'SetColor') {
        const [validador, message] = validarCorHex(messageModal)
        if (validador === false) {
          await interaction.editReply({ content: message })
          return
        }
      }

      await db.messages.set(`${guildId}.${type}.${channelId}.messages.${message?.id}.${modalType}`, messageModal)
      await channel?.messages.fetch(String(message?.id))
        .then(async (msg) => {
          const { embed } = await db.messages.get(`${guildId}.${type}.${channelId}.messages.${message?.id}`)
          if (typeof embed?.color === 'string') {
            if (embed?.color?.startsWith('#') === true) {
              embed.color = parseInt(embed?.color.slice(1), 16)
            }
          }
          await msg.edit({ embeds: [embed] })
            .then(async () => {
              await db.messages.set(`${guildId}.${type}.${channelId}.messages.${message?.id}.properties.${customId}`, true)
                .then(async () => {
                  if (type === 'ticket') {
                    await ticketButtonsConfig(interaction, msg)
                  } else {
                    await paymentButtonsConfig(interaction, msg)
                  }
                  await interaction.editReply({ content: `${modalType} alterado para ${messageModal}` })
                })
            })
        })
        .catch(async (err) => {
          console.log(err)
          await interaction.editReply({ content: '❌ | Ocorreu um erro!' })
        })
    }
  }

}
)
