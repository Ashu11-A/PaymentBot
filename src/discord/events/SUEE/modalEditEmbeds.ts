// Sistema Unificado de Edição de Embeds (SUEE)

import { db } from '@/app'
import { updateProduct } from '@/discord/commands/payments/utils/updateProduct'
import { ticketButtonsConfig } from '@/discord/commands/tickets/utils/ticketUpdateConfig'
import { Event } from '@/discord/base'
import { validarCorHex } from '@/functions'
import { EmbedBuilder } from 'discord.js'

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
        .then(async (message) => {
          const data = await db.messages.get(`${guildId}.${type}.${channelId}.messages.${message?.id}`)
          const updateEmbed = new EmbedBuilder(data?.embed)

          if (type === 'payments') {
            if (data?.price !== undefined && data.price !== '') {
              updateEmbed.addFields(
                {
                  name: '💵 | Preço:',
                  value: `R$${data.price}`
                }
              )
            }
            if (data?.coins !== undefined && data.coins !== '') {
              updateEmbed.addFields({
                name: '🪙 | Coins:',
                value: data.coins
              })
            }
          }

          if (data?.role !== undefined && data.role !== '') {
            updateEmbed.addFields({
              name: '🛂 | Você receberá o cargo:',
              value: `<@&${data.role}>`
            })
          }

          if (data?.embed !== undefined) {
            if (data.embed?.color !== undefined && typeof data.embed?.color === 'string') {
              if (data.embed.color?.startsWith('#') === true) {
                updateEmbed.setColor(parseInt(data.embed.color.slice(1), 16))
              }
            }
          }
          await message.edit({ embeds: [updateEmbed] })
            .then(async () => {
              await db.messages.set(`${guildId}.${type}.${channelId}.messages.${message?.id}.properties.${customId}`, true)
                .then(async () => {
                  if (type === 'ticket') {
                    await ticketButtonsConfig(interaction, message)
                  } else if (type === 'payments') {
                    await updateProduct.buttonsConfig({
                      interaction,
                      message
                    })
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
})
