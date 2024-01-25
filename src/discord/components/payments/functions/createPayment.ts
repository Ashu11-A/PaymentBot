import { db } from '@/app'
import { EmbedBuilder, type ButtonInteraction, type CacheType, AttachmentBuilder, type APIEmbed, type ActionRowBuilder, type ButtonBuilder, type JSONEncodable } from 'discord.js'
import { UpdateCart } from './UpdateCart'
import axios from 'axios'
import { settings } from '@/settings'
import { PaymentFunction } from '../cart/functions/cartCollectorFunctions'
import { type cartData, type infoPayment } from './interfaces'

export async function createPayment (options: {
  interaction: ButtonInteraction<CacheType>
  method: 'pix' | 'debit_card' | 'credit_card'
}): Promise<void> {
  const { interaction, method } = options
  if (!interaction.inGuild()) {
    await interaction.editReply({
      embeds: [new EmbedBuilder({
        title: 'Houve um erro, parece que você não está numa Guilda!?'
      }).setColor('Red')]
    })
    return
  }
  const { message, guildId, user, channelId } = interaction
  const tax = await db.payments.get(`${guildId}.config.taxes.${method}`)
  const cartData = await db.payments.get(`${guildId}.process.${channelId}`) as cartData
  const amount: number = cartData.products.reduce((allValue, product) => allValue + (
    typeof product.cupom?.porcent === 'number'
      ? (product.amount - (product.amount * product.cupom.porcent / 100))
      : (product.amount)
  ) * product.quantity, 0) ?? 0
  const amountTax = Math.round((amount + (amount * (Number(tax) / 100))) * 100) / 100 // Pode receber numeros quebrados por isso do "* 100) / 100"
  const { mcToken, ipn } = await db.payments.get(`${guildId}.config`)
  const PaymentBuilder = new PaymentFunction({ interaction })

  let embeds: Array<APIEmbed | JSONEncodable<APIEmbed>> = [] // Inicialize embeds como um array vazio
  let components: Array<ActionRowBuilder<ButtonBuilder>> = []

  const files: AttachmentBuilder[] = []
  const dataPix: infoPayment = {
    userName: user.username,
    userId: user.id,
    mpToken: mcToken,
    channelId,
    guildId,
    UUID: cartData.UUID as string,
    price: amountTax
  }

  if (method === 'pix') {
    const paymentCreate = await axios.post(`http://${settings.Express.ip}:${settings.Express.Port}/payment/create/pix`, dataPix).catch(async (err) => {
      console.log(err)
      const embed = new EmbedBuilder({
        title: `👋 Olá,  ${user.username}`,
        description: 'Ocorreu um inconveniente durante a execução da consulta no nosso sistema de backend. Recomendo que entre em contato com um administrador para solucionar essa questão.'
      }).setColor('Red')
      if (err.message !== undefined) {
        embed.addFields([
          { name: '❌ Error:', value: err.message }
        ])
      }
      await interaction.editReply({ embeds: [embed] })
    })
    if (paymentCreate === undefined) return
    if (paymentCreate.status === 200) {
      const { unixTimestamp, paymentData } = paymentCreate.data

      const buf = Buffer.from(paymentData.point_of_interaction.transaction_data.qr_code_base64, 'base64')
      const id = paymentData.id

      await PaymentBuilder.NextOrBefore({ type: 'next', update: 'No' })

      const cartBuilder = new UpdateCart({ interaction, cartData: { ...cartData, typeEmbed: cartData.typeEmbed += 1 } })
      const UpdateCartData = await cartBuilder.embedAndButtons({ paymentData, taxa: (tax ?? 1) })
      const newEmbeds = UpdateCartData?.main.embeds
      const newComponents = UpdateCartData?.main.components
      if (newEmbeds === undefined || newComponents === undefined) return

      await db.payments.set(`${guildId}.process.${channelId}.paymentId`, id)

      embeds = newEmbeds
      components = newComponents

      const attachment = new AttachmentBuilder(buf, { name: `${id}.png` })
      const pixEmbed = new EmbedBuilder({
        title: '✅ QR Code gerado com sucesso!',
        description: 'Aguardando pagamento. Após a verificação, os seus créditos serão entregues.',
        fields: [
          {
            name: '**📆 Pague até:** ',
            value: `<t:${unixTimestamp}:f>`
          }
        ],
        thumbnail: { url: 'https://cdn.discordapp.com/attachments/864381672882831420/1028227669650845727/loading.gif' },
        image: { url: `attachment://${id}.png` },
        footer: { text: `ID: ${id}` }
      }).setColor('Green')

      embeds.push(pixEmbed.toJSON())

      const pixCode = paymentData.point_of_interaction.transaction_data.qr_code
      if (pixCode !== undefined) {
        const pixCodeEmbed = new EmbedBuilder({
          title: 'Pix copia e cola',
          description: pixCode,
          footer: { text: 'No celular, pressione para copiar.', iconURL: (interaction?.guild?.iconURL({ size: 64 }) ?? undefined) }
        }).setColor('Green')
        embeds.push(pixCodeEmbed.toJSON())
      }

      files.push(attachment)

      components[0].components[0].setURL(paymentData.point_of_interaction.transaction_data.ticket_url)
    } else {
      await interaction.editReply({
        embeds: [
          new EmbedBuilder({
            title: '❌ | Ocorreu um erro, tente novamente...'
          }).setColor('Red')
        ]
      })
    }
  } else if (method === 'debit_card' || method === 'credit_card') {
    const dataCart: infoPayment = {
      userName: user.username,
      userId: user.id,
      mpToken: mcToken,
      channelId,
      guildId,
      UUID: cartData.UUID as string,
      price: amountTax,
      method,
      ipn
    }
    const paymentCreate = await axios.post(`http://${settings.Express.ip}:${settings.Express.Port}/payment/create/card`, dataCart)

    if (paymentCreate.status === 200) {
      const { paymentData, unixTimestamp } = paymentCreate.data
      console.log(paymentData)

      await PaymentBuilder.NextOrBefore({ type: 'next', update: 'No' })

      const cartBuilder = new UpdateCart({ interaction, cartData: { ...cartData, typeEmbed: (cartData.typeEmbed += 1) } })
      const UpdateCartData = await cartBuilder.embedAndButtons({ paymentData, taxa: (method === 'debit_card' ? (tax ?? 2) : (tax ?? 5)) })
      const newEmbeds = UpdateCartData?.main.embeds
      const newComponents = UpdateCartData?.main.components
      if (newEmbeds === undefined || newComponents === undefined) return

      embeds = newEmbeds
      components = newComponents

      const cartEmbed = new EmbedBuilder({
        title: '✅ URL de pagamento gerado com sucesso!',
        description: 'Aguardando pagamento. Após a verificação, os seus créditos serão entregues.',
        thumbnail: { url: 'https://cdn.discordapp.com/attachments/864381672882831420/1028227669650845727/loading.gif' },
        fields: [
          {
            name: '**📆 Pague até:** ',
            value: `<t:${unixTimestamp}:f>`
          }
        ]
      }).setColor('Green')

      embeds.push(cartEmbed.toJSON())
      components[0].components[0].setURL(paymentData.init_point)
    }
  }
  const clearData = { components: [], embeds: [], files: [] }
  await message.edit({
    ...clearData,
    embeds,
    components,
    files
  })
}
