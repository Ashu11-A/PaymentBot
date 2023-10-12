import { db } from '@/app'
import { updateProduct } from '@/discord/components/payments'
import { validarValor } from '@/functions'
import { type ModalSubmitInteraction, type CacheType } from 'discord.js'

export default async function collectorModal (interaction: ModalSubmitInteraction<CacheType>, key: string, value: any): Promise<void> {
  if (!interaction.inGuild()) return

  const { customId, guildId, channel, channelId, message, fields } = interaction
  const { type } = value
  let messageModal: string | number = fields.getTextInputValue('content')

  await interaction.deferReply({ ephemeral: true })

  if (messageModal.toLowerCase() === 'vazio') {
    messageModal = ''
  }

  if (customId === 'paymentSetPrice' || customId === 'paymentAddCoins') {
    const [validador, message] = validarValor(messageModal)
    messageModal = Number(messageModal.replace(',', '.'))
    if (validador === false) {
      await interaction.editReply({ content: message })
      return
    }
  }

  await db.messages.set(`${guildId}.payments.${channelId}.messages.${message?.id}.${type}`, messageModal)
  await channel?.messages.fetch(String(message?.id))
    .then(async (msg) => {
      await updateProduct.embed({
        interaction,
        message: msg
      })
        .then(async () => {
          await interaction.editReply({ content: '✅ | Elemento ' + '`' + type + '`' + ' foi alterado com sucesso!' })
        })
    })
    .catch(async (err: Error) => {
      console.log(err)
      await interaction.editReply({ content: '❌ | Ocorreu um erro!' })
    })
}
