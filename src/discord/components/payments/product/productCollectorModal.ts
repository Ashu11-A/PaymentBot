import { db } from '@/app'
import { updateProduct } from '@/discord/components/payments'
import { validarValor } from '@/functions'
import { type ModalSubmitInteraction, type CacheType } from 'discord.js'
import { getModalData } from './functions/getModalData'

export async function productCollectorModal (options: { interaction: ModalSubmitInteraction<CacheType>, key: string }): Promise<void> {
  const { interaction, key } = options
  if (!interaction.inGuild()) return
  await interaction.deferReply({ ephemeral: true })

  const { guildId, channel, channelId, message, fields } = interaction
  const { type } = getModalData(key)
  let messageModal: string | number = fields.getTextInputValue('content')

  if (messageModal.toLowerCase() === 'vazio') messageModal = ''
  if (key === 'SetPrice' || key === 'AddCoins') {
    const [validador, message] = validarValor(messageModal)
    messageModal = Number(messageModal.replace(',', '.'))
    if (!validador) {
      await interaction.editReply({ content: message })
      return
    }
  }

  await db.messages.set(`${guildId}.payments.${channelId}.messages.${message?.id}.${type}`, messageModal)
  await channel?.messages.fetch(String(message?.id))
    .then(async (msg) => {
      await updateProduct.embed({ interaction, message: msg, button: key })
        .then(async () => {
          await interaction.editReply({ content: '✅ | Elemento ' + '`' + type + '`' + ' foi alterado com sucesso!' })
        })
    })
    .catch(async (err: Error) => {
      console.log(err)
      await interaction.editReply({ content: '❌ | Ocorreu um erro!' })
    })
}
