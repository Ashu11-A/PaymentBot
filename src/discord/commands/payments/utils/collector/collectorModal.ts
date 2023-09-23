import { db } from '@/app'
import { validarValor } from '@/functions'
import { type ModalSubmitInteraction, type CacheType } from 'discord.js'
import { updateCard } from '../updateCard'

export default async function collectorModal (interaction: ModalSubmitInteraction<CacheType>, key: string, value: any): Promise<void> {
  const { customId, guildId, channel, message, fields, user } = interaction
  if (customId === key) {
    await interaction.deferReply({ ephemeral: true })

    // typeRedeem
    if (customId === 'paymentUserDirect') {
      const type = 2
      await db.payments.set(`${guildId}.process.${user.id}.typeRedeem`, type)
    }

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
        await db.payments.get(`${guildId}.process.${user.id}`)
          .then(async (data) => {
            await updateCard.embedAndButtons({
              interaction,
              data,
              message
            })
            await updateCard.displayData({
              interaction,
              data,
              type: 'editReply'
            })
          }).catch(async (err: Error) => {
            console.log(err)
            await interaction.editReply({ content: '❌ | Ocorreu um erro!' })
          })
      })
  }
}
