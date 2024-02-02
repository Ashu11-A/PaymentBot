import { core, db } from '@/app'
import { UpdateCart } from '@/discord/components/payments'
import { validarEmail } from '@/functions'
import { ctrlPanel } from '@/functions/ctrlPanel'
import { EmbedBuilder, type CacheType, type ModalSubmitInteraction } from 'discord.js'
import { getModalData } from './functions/getModalData'
import { PaymentFunction } from './functions/cartCollectorFunctions'

export default async function cartCollectorModal (options: {
  interaction: ModalSubmitInteraction<CacheType>
  key: string
}): Promise<void> {
  const { interaction, key } = options
  if (!interaction.inGuild()) return

  const { guildId, user, channel, message, fields, channelId } = interaction
  const { db: dataDB } = getModalData(key)
  const messageModal = fields.getTextInputValue('content')

  if (key === 'Direct') {
    const [validador, messageInfo] = validarEmail(messageModal)
    if (validador) {
      core.info(`Solicitação para o E-mail: ${messageModal}`)
      const userData = await ctrlPanel.searchEmail({ interaction, email: messageModal })

      if (userData !== undefined) {
        await db.payments.set(`${guildId}.process.${channelId}.user`, userData)

        if (message !== null) {
          const PaymentBuilder = new PaymentFunction({ interaction, key })

          await db.payments.set(`${guildId}.process.${channelId}.typeRedeem`, 2)
          await db.payments.set(`${guildId}.process.${channelId}.properties.${key}`, true)
          await db.payments.delete(`${guildId}.process.${channelId}.properties.DM`)
          await PaymentBuilder.NextOrBefore({ type: 'next', update: 'No' })

          const cartData = await db.payments.get(`${guildId}.process.${channelId}`)
          const cartBuilder = new UpdateCart({ interaction, cartData })
          await interaction.deleteReply()
          await cartBuilder.embedAndButtons({ message })
        }
      }
    } else {
      await interaction.reply({ ephemeral, content: messageInfo })
    }
    return
  }

  if (key === 'Cupom') {
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
      const cartData = await db.payments.get(`${guildId}.process.${channelId}`)
      if (codeVerify?.usosMax !== null && (cartData?.quantity > codeVerify?.usosMax || codeVerify[user.id]?.usos > codeVerify?.usosMax)) {
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
      await db.payments.set(`${guildId}.process.${channelId}.cupom`, {
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

      const data = await db.payments.get(`${guildId}.process.${channelId}`)
      const msg = await channel?.messages.fetch(String(message?.id))
      const cartBuilder = new UpdateCart({ interaction, cartData: data })
      await cartBuilder.embedAndButtons({ message: msg })
    }
    return
  }

  await interaction.deferReply({ ephemeral: true })
  await db.payments.set(`${guildId}.process.${channelId}.${dataDB}`, messageModal)
  await channel?.messages.fetch(String(message?.id))
    .then(async (msg) => {
      await db.payments.set(`${guildId}.process.${msg.id}.properties.${key}`, true)
      await db.payments.get(`${guildId}.process.${msg.id}`)
        .then(async (data) => {
          const cartBuilder = new UpdateCart({ interaction, cartData: data })
          await cartBuilder.embedAndButtons({ message: msg })
          /* Modo debug
          await UpdateCart.displayData({
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
