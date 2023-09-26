import { db } from '@/app'
import { validarEmail, validarValor } from '@/functions'
import { type ModalSubmitInteraction, type CacheType } from 'discord.js'
import { updateCard } from '@/discord/components/payments'

export default async function collectorModal (interaction: ModalSubmitInteraction<CacheType>, key: string, value: any): Promise<void> {
  if (!interaction.inGuild()) return

  const { customId, guildId, channel, message, fields } = interaction
  const { type } = value
  const messageModal = fields.getTextInputValue('content')
  if (customId === key) {
    await interaction.deferReply({ ephemeral: true })

    // typeRedeem
    if (customId === 'paymentUserDirect') {
      const [validador, messageInfo] = validarEmail(messageModal)
      if (validador) {
        const type = 2
        await db.payments.set(`${guildId}.process.${message?.id}.typeRedeem`, type)
      } else {
        await interaction.editReply({ content: messageInfo })
        return
      }
    }

    if (customId === 'paymentSetPrice') {
      const [validador, message] = validarValor(messageModal)
      if (validador === false) {
        await interaction.editReply({ content: message })
        return
      }
    }

    await db.payments.set(`${guildId}.process.${message?.id}.${type}`, messageModal)
    await channel?.messages.fetch(String(message?.id))
      .then(async (msg) => {
        await db.payments.set(`${guildId}.process.${msg.id}.properties.${customId}`, true)
        await db.payments.get(`${guildId}.process.${msg.id}`)
          .then(async (data) => {
            await updateCard.embedAndButtons({
              interaction,
              data,
              message: msg
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
