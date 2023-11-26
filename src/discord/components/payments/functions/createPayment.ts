import { db } from '@/app'
import { EmbedBuilder, type ButtonInteraction, type CacheType, AttachmentBuilder, type APIEmbed, type ActionRowBuilder, type ButtonBuilder, type JSONEncodable } from 'discord.js'
import { PaymentFunction } from '../cartCollector/functions/collectorFunctions'
import { updateCart } from './updateCart'
import axios from 'axios'
import { settings } from '@/settings'

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class Payment {
  /**
    * Método de pagamento
    */
  public static async create (options: {
    interaction: ButtonInteraction<CacheType>
    method: 'pix' | 'debit_card' | 'credit_card'
  }): Promise<void> {
    const { interaction, method } = options
    const { message, guildId, user } = interaction
    const tax = await db.payments.get(`${guildId}.config.taxes.${method}`)
    const cartData = await db.payments.get(`${guildId}.process.${message.id}`)
    const { amount: cartAmount, quantity, cupom } = cartData
    const amount = Number(((typeof cupom?.porcent === 'number' ? (cartAmount - (cartAmount * cupom.porcent / 100)) : cartAmount) * (quantity ?? 1)).toFixed(2))
    const amountTax = Math.round(amount + (amount * (Number(tax) / 100)))
    const { mcToken, ipn } = await db.payments.get(`${guildId}.config`)

    let embeds: Array<APIEmbed | JSONEncodable<APIEmbed>> = [] // Inicialize embeds como um array vazio
    let components: Array<ActionRowBuilder<ButtonBuilder>> = []

    const files: AttachmentBuilder[] = []

    if (method === 'pix') {
      const paymentCreate = await axios.post(`http://${settings.Express.ip}:${settings.Express.Port}/payment/create/pix`, {
        userName: user.username,
        userId: user.id,
        mpToken: mcToken,
        valor: amountTax
      })

      if (paymentCreate.status === 200) {
        const { unixTimestamp, paymentData } = paymentCreate.data

        const buf = Buffer.from(paymentData.point_of_interaction.transaction_data.qr_code_base64, 'base64')
        const id = paymentData.id

        await PaymentFunction.NextOrBefore({ interaction, type: 'next', update: 'No' })

        const { embeds: newEmbeds, components: newComponents } = await updateCart.embedAndButtons({
          data: {
            ...cartData,
            typeEmbed: cartData.typeEmbed += 1
          },
          interaction,
          paymentData,
          taxa: (tax ?? 1)
        })

        await db.payments.set(`${guildId}.process.${message.id}.paymentId`, id)

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
      const infoPayment = {
        userId: interaction.user.id,
        guildId,
        messageId: message.id,
        price: amountTax,
        UUID: cartData.UUID
      }
      const paymentCreate = await axios.post(`http://${settings.Express.ip}:${settings.Express.Port}/payment/create/cart`, {
        userName: user.username,
        userId: user.id,
        mpToken: mcToken,
        valor: amountTax,
        method,
        ipn,
        infoPayment
      })

      if (paymentCreate.status === 200) {
        const { paymentData, unixTimestamp } = paymentCreate.data
        console.log(paymentData)

        await PaymentFunction.NextOrBefore({ interaction, type: 'next', update: 'No' })

        const { embeds: newEmbeds, components: newComponents } = await updateCart.embedAndButtons({
          data: {
            ...cartData,
            typeEmbed: (cartData.typeEmbed += 1)
          },
          interaction,
          paymentData,
          taxa: (method === 'debit_card' ? (tax ?? 2) : (tax ?? 5))
        })

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
}
