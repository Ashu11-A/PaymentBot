import { core, db } from '@/app'
import { validarEmail } from '@/functions'
import { type ModalSubmitInteraction, type CacheType, EmbedBuilder } from 'discord.js'
import { updateCard } from '@/discord/components/payments'
import { ctrlPanel } from '@/functions/ctrlPanel'
import { type collectorButtonsForModals } from '@/settings/interfaces/Collector'

export default async function collectorModal (interaction: ModalSubmitInteraction<CacheType>, key: string, value: collectorButtonsForModals): Promise<void> {
  if (!interaction.inGuild()) return

  const { customId, guildId, user, channel, message, fields } = interaction
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
          await db.payments.set(`${guildId}.process.${message.id}.typeRedeem`, 2)
          await db.payments.set(`${guildId}.process.${message.id}.properties.${customId}`, true)
          await db.payments.delete(`${guildId}.process.${message.id}.properties.paymentUserDM`)
          const data = await db.payments.get(`${guildId}.process.${message.id}`)
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

  if (customId === 'paymentUserCupom') {
    const codeVerify = await db.payments.get(`${guildId}.cupons.${messageModal.toLowerCase()}`)

    if (codeVerify === undefined) {
      await interaction.reply({
        ephemeral,
        embeds: [
          new EmbedBuilder({
            title: '❌ | Cupom não encontrado!'
          }).setColor('Red')
        ]
      })
    } else {
      const cardData = await db.payments.get(`${guildId}.process.${message?.id}`)
      if (codeVerify?.usosMax !== null && (cardData?.quantity > codeVerify?.usosMax || codeVerify[user.id]?.usos > codeVerify?.usosMax)) {
        await interaction.reply({
          ephemeral,
          embeds: [
            new EmbedBuilder({
              title: `O cupom não pode ser utilizado em mais de ${codeVerify.usosMax} produto(s)`
            }).setColor('Red')
          ]
        })
        return
      }
      await db.payments.set(`${guildId}.process.${message?.id}.cupom`, {
        name: messageModal.toLowerCase(),
        porcent: codeVerify.desconto
      })
      await db.payments.add(`${guildId}.cupons.${messageModal.toLowerCase()}.${user.id}.usos`, 1)

      await interaction.reply({
        ephemeral,
        embeds: [
          new EmbedBuilder({
            title: `✅ | Cupom ${messageModal}, foi definido!`
          }).setColor('Green')
        ]
      })

      const data = await db.payments.get(`${guildId}.process.${message?.id}`)
      const msg = await channel?.messages.fetch(String(message?.id))
      await updateCard.embedAndButtons({
        interaction,
        data,
        message: msg
      })
    }
    return
  }

  await interaction.deferReply({ ephemeral: true })
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
          /* Modo debug
          await updateCard.displayData({
            interaction,
            data,
            type: 'editReply'
          })
          */
          await interaction.deleteReply()
        }).catch(async (err: Error) => {
          console.log(err)
          await interaction.editReply({ content: '❌ | Ocorreu um erro!' })
        })
    })
}
