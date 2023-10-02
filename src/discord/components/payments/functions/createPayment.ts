import { db } from '@/app'
import mc from 'mercadopago'
import { EmbedBuilder, type ButtonInteraction, type CacheType, AttachmentBuilder } from 'discord.js'

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class createPayment {
  /**
    * Método de pagamento
    */
  public static async embed (options: {
    interaction: ButtonInteraction<CacheType>
    method: 'pix' | 'debit_card' | 'credit_card'
  }): Promise<void> {
    const { interaction, method } = options
    const { message, guildId } = interaction
    const data = await db.payments.get(`${guildId}.process.${message.id}`)
    const amount = Number(data.amount) * data.quantity

    const embeds: EmbedBuilder[] = []
    const files: AttachmentBuilder[] = []

    if (method === 'pix') {
      await createPayment.pix({
        data,
        interaction
      }).then(async ([unixTimestamp, payment, buf, id]) => {
        const attachment = new AttachmentBuilder(buf, { name: `${id}.png` })
        const pixEmbed = new EmbedBuilder({
          title: '✅ QR Code gerado com sucesso!',
          description: 'Aguardando pagamento. Após a verificação, os seus créditos serão entregues.',
          thumbnail: { url: 'https://cdn.discordapp.com/attachments/864381672882831420/1028227669650845727/loading.gif' },
          fields: [
            {
              name: '**🛒 Resumo:** ',
              value: `
                  (~) Valor Inicial: R$${amount ?? 0}
                  (-) Cupom: R$${data?.cupom?.desconto ?? 0} (${
                      data?.cupom?.porcent ?? 0
                  }%)
                  (+) Taxas: R$${(
                    payment.transaction_amount -
                    (data?.cupom?.cupomAmount ?? amount)
                  ).toFixed(2)} (1%)
                  (=) Total: R$${payment.transaction_amount ?? 0}`
            },
            {
              name: '**🪙 Créditos:** ',
              value: `${data.coins}`
            },
            {
              name: '**📆 Pague até:** ',
              value: `<t:${unixTimestamp}:f>`
            }
          ],
          image: { url: `attachment://${id}.png` },
          footer: { text: `ID: ${id}` }
        })
          .setColor('Red')

        const pixCodeEmbed = new EmbedBuilder({
          title: 'Pix copia e cola',
          description: data.body.point_of_interaction.transaction_data.qr_code,
          footer: { text: 'No celular, pressione para copiar o código.', iconURL: (interaction?.guild?.iconURL({ size: 64 }) ?? undefined) }
        })

        embeds.push(pixEmbed, pixCodeEmbed)

        files.push(attachment)
      }).catch(async (err) => {
        console.log(err)
        await interaction.editReply({
          embeds: [
            new EmbedBuilder({
              title: '❌ | Ocorreu um erro, tente novamente...'
            }).setColor('Red')
          ]
        })
      })
    } else if (method === 'debit_card' || method === 'credit_card') {
      await createPayment.card({
        data,
        interaction,
        method
      }).then(async ([unixTimestamp, payment, taxa]) => {
        const cardEmbed = new EmbedBuilder({
          title: '✅ URL de pagamento gerado com sucesso!',
          description: 'Aguardando pagamento. Após a verificação, os seus créditos serão entregues.',
          thumbnail: { url: 'https://cdn.discordapp.com/attachments/864381672882831420/1028227669650845727/loading.gif' },
          fields: [
            {
              name: '**🛒 Resumo:** ',
              value: `
                (~) Valor Inicial: R$${amount ?? 0}
                (-) Cupom: R$${data?.cupom?.desconto ?? 0} (${
                    data?.cupom?.porcent ?? 0
                }%)
                (+) Taxas: R$${(
                  payment.response.items[0].unit_price -
                  (data?.cupom?.cupomAmount ?? data?.amount)
                ).toFixed(2)} (${taxa}%)
                (=) Total: R$${payment.response.items[0].unit_price ?? 0}`
            },
            {
              name: '**🪙 Créditos:** ',
              value: `${data.coins}`
            },
            {
              name: '**📆 Pague até:** ',
              value: `<t:${unixTimestamp}:f>`
            }
          ]
        })
        embeds.push(cardEmbed)
      }).catch(async (err) => {
        console.log(err)
        await interaction.editReply({
          embeds: [
            new EmbedBuilder({
              title: '❌ | Ocorreu um erro, tente novamente...'
            }).setColor('Red')
          ]
        })
      })
    }
    const clearData = { components: [], embeds: [], files: [] }
    await message.edit({
      ...clearData,
      embeds,
      files
    })
  }

  /**
   * Criar pagamento por PIX
   */
  public static async pix (options: {
    interaction: ButtonInteraction<CacheType>
    data: any
  }): Promise<any[]> {
    const { interaction, data } = options
    const { guildId } = interaction
    const token = await db.guilds.get(`${guildId}.payments.mcToken`)
    const amount = Number(data.amount) * data.quantity

    mc.configure({
      access_token: token
    })

    const paymentData = {
      payer: {
        first_name: interaction.user.username,
        last_name: interaction.user.id,
        email: `${interaction.user.id}@gmail.com`
      },
      description: `Pagamento Via Discord | ${interaction.user.username} | R$${(
        amount + amount * 0.01
      ).toFixed(2)}`,
      transaction_amount: amount + amount * 0.01,
      payment_method_id: 'pix',
      installments: 0
    }

    const payment = await mc.payment.create(paymentData)

    const base64Img = payment.body.point_of_interaction.transaction_data.qr_code_base64
    const buf = Buffer.from(base64Img, 'base64')
    const id = payment.body.id

    const dateStr = payment.body.date_of_expiration
    const expirationDate = new Date(dateStr)
    expirationDate.setMinutes(expirationDate.getMinutes())
    const unixTimestamp = Math.floor(expirationDate.getTime() / 1000)

    return [unixTimestamp, paymentData, buf, id]
  }

  /**
   * Criar pagamento por Cartão
   */
  public static async card (options: {
    interaction: ButtonInteraction<CacheType>
    data: any
    method: 'debit_card' | 'credit_card'
  }): Promise<any[]> {
    const { interaction, data, method } = options
    const { guildId } = interaction
    const token = await db.guilds.get(`${guildId}.payments.mcToken`)
    const date = new Date()
    date.setDate(date.getDate() + 3)
    const isoDate = date.toISOString()

    mc.configure({
      access_token: token
    })

    let taxa: number = 0.02
    if (method === 'credit_card') {
      taxa = 0.05
    }
    const amount = (Number(data.amount) * data.quantity) * taxa

    const payment = await mc.preferences.create({
      payer: {
        name: interaction.user.username,
        surname: interaction.user.id,
        email: `${interaction.user.id}@gmail.com`
      },
      items: [
        {
          title: 'Pagamento Via Discord',
          description: `${interaction.user.username} | R$${amount.toFixed(2)}`,
          unit_price: amount,
          quantity: 1,
          currency_id: 'BRL'
        }
      ],
      payment_methods: {
        excluded_payment_types: [{ id: 'ticket' }, { id: 'bank_transfer' }],
        excluded_payment_methods: [
          { id: method }
        ],
        installments: 1
      },
      notification_url: 'https://bot.seventyhost.net/ipn',
      date_of_expiration: isoDate
    })

    console.log((payment.response).items)

    const dateStr = payment.body.date_of_expiration
    const expirationDate = new Date(dateStr)
    expirationDate.setMinutes(expirationDate.getMinutes())
    const unixTimestamp = Math.floor(expirationDate.getTime() / 1000)

    return [unixTimestamp, payment, taxa]
  }
}
