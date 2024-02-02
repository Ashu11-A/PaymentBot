import { db } from '@/app'
import { UpdateProduct } from '@/discord/components/payments/product/functions/updateProduct'
import { validarValor } from '@/functions'
import { type ModalSubmitInteraction, type CacheType } from 'discord.js'
import { getModalData } from './functions/getModalData'

export async function productCollectorModal (options: { interaction: ModalSubmitInteraction<CacheType>, key: string }): Promise<void> {
  const { interaction, key } = options
  if (!interaction.inGuild()) return
  await interaction.deferReply({ ephemeral: true })

  const { guildId, channel, channelId, message, fields } = interaction
  const { db: dataDB } = getModalData(key)
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

  await db.messages.set(`${guildId}.payments.${channelId}.messages.${message?.id}.${dataDB}`, messageModal)
  await channel?.messages.fetch(String(message?.id))
    .then(async (msg) => {
      const productBuilder = new UpdateProduct({ interaction, message: msg })
      await productBuilder.embed({ button: key })
        .then(async () => {
          await interaction.editReply({ content: '✅ | Elemento ' + '`' + dataDB + '`' + ' foi alterado com sucesso!' })
        })
    })
    .catch(async (err: Error) => {
      console.log(err)
      await interaction.editReply({ content: '❌ | Ocorreu um erro!' })
    })
}
