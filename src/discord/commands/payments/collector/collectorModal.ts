import { db } from '@/app'
import { updateProduct } from '@/discord/commands/payments/utils/updateProduct'
import { validarValor } from '@/functions'
import { type ModalSubmitInteraction, type CacheType } from 'discord.js'

export default async function collectorModal (interaction: ModalSubmitInteraction<CacheType>, key: string, value: any): Promise<void> {
  const { customId, guildId, channel, channelId, message, fields } = interaction
  if (customId === key) {
    await interaction.deferReply({ ephemeral: true })

    const { type } = value
    let messageModal = fields.getTextInputValue('content')

    if (messageModal.toLowerCase() === 'vazio') {
      messageModal = ''
    }

    if (customId === 'paymentSetPrice') {
      const [validador, message] = validarValor(messageModal)
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
            await interaction.editReply({ content: `${type} alterado para ${messageModal}` })
          })
      })
      .catch(async (err: Error) => {
        console.log(err)
        await interaction.editReply({ content: '❌ | Ocorreu um erro!' })
      })
  }
}
