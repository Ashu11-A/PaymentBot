import { db } from '@/app'
import { validarValor } from '@/functions'
import { type ModalSubmitInteraction, type CacheType } from 'discord.js'
import { paymentEmbed } from '../paymentEmbed'

export default async function collectorModal (interaction: ModalSubmitInteraction<CacheType>, key: string, value: any): Promise<void> {
  const { customId, guildId, channel, message, fields, user } = interaction
  console.log(key)
  if (customId === key) {
    await interaction.deferReply({ ephemeral: true })

    const { type } = value
    const messageModal = fields.getTextInputValue('content')
    console.log('type:', type)
    console.log('messageModal:', messageModal)

    if (customId === 'paymentSetPrice') {
      const [validador, message] = validarValor(messageModal)
      if (validador === false) {
        await interaction.editReply({ content: message })
        return
      }
    }

    await db.payments.set(`${guildId}.process.${user.id}.${type}`, messageModal)
    await channel?.messages.fetch(String(message?.id))
      .then(async (message) => {
        await db.payments.set(`${guildId}.process.${user.id}.properties.${customId}`, true)
          .then(async () => {
            await paymentEmbed.TypeRedeem({
              interaction,
              message,
              typeEmbed: 1
            })
            await interaction.editReply({ content: `${type} alterado para ${messageModal}` })
          }).catch(async (err: Error) => {
            console.log(err)
            await interaction.editReply({ content: '❌ | Ocorreu um erro!' })
          })
      })
  }
}
