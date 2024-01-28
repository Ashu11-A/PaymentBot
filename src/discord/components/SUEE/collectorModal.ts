// Sistema Unificado de Edição de Embeds (SUEE)

import { db } from '@/app'
import { UpdateProduct } from '@/discord/components/payments/product/functions/updateProduct'
import { ticketButtonsConfig } from '@/discord/components/tickets'
import { validarCorHex } from '@/functions'
import { type CacheType, type ModalSubmitInteraction } from 'discord.js'
import { getTypeAndKey } from './functions/getTypeAndKey'
import { getModalData } from './functions/getModalData'

export async function collectorEditModal (options: { interaction: ModalSubmitInteraction<CacheType>, key: string }): Promise<void> {
  const { interaction, key } = options
  const { guildId, channelId, message, fields } = interaction
  const [type, button] = getTypeAndKey(key)

  if (type !== null && message !== null && button !== null) {
    try {
      await interaction.deferReply({ ephemeral: true })
      const { db: dataDB } = getModalData(button)
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

      const productBuilder = new UpdateProduct({ interaction, message })

      await db.messages.set(`${guildId}.${type}.${channelId}.messages.${message?.id}.${dataDB}`, messageModal)
      await db.messages.set(`${guildId}.${type}.${channelId}.messages.${message?.id}.properties.${button}`, true)
      console.log(type, button)
      if (type === 'ticket') {
        await ticketButtonsConfig(interaction, message)
      } else if (type === 'payments') {
        await productBuilder.embed({ button })
      }
      await interaction.editReply({ content: '✅ | Elemento ' + '`' + key + '`' + ' foi alterado com sucesso!' })
    } catch (err) {
      console.log(err)
      await interaction.editReply({ content: '❌ | Ocorreu um erro!' })
    }
  }
}
