import { core, db } from '@/app'
import { validarEmail, validarValor } from '@/functions'
import { type ModalSubmitInteraction, type CacheType } from 'discord.js'
import { updateCard } from '@/discord/components/payments'
import { ctrlPanel } from '@/functions/ctrlPanel'

export default async function collectorModal (interaction: ModalSubmitInteraction<CacheType>, key: string, value: any): Promise<void> {
  if (!interaction.inGuild()) return

  const { customId, guildId, channel, message, fields } = interaction
  const { type } = value
  const messageModal = fields.getTextInputValue('content')

  if (customId === 'paymentUserDirect') {
    const [validador, messageInfo] = validarEmail(messageModal)
    if (validador) {
      core.info(`Solicitação para o E-mail: ${messageModal}`)
      const userData = await ctrlPanel.searchEmail({ interaction, email: messageModal })

      if (userData !== undefined) {
        await db.payments.set(`${guildId}.process.${message?.id}.user`, userData)

        if (message !== null) {
          const data = await db.payments.get(`${guildId}.process.${message.id}`)

          await db.payments.set(`${guildId}.process.${message.id}.typeRedeem`, 2)
          await db.payments.set(`${guildId}.process.${message.id}.properties.${customId}`, true)
          await db.payments.delete(`${guildId}.process.${message.id}.properties.paymentUserDM`)
          await updateCard.embedAndButtons({
            interaction,
            data,
            message
          })
        }
      }
    } else {
      await interaction.reply({ ephemeral, content: messageInfo })
    }
    return
  }

  await interaction.deferReply({ ephemeral: true })

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
