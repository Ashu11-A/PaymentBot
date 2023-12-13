import { db } from '@/app'
import { CustomButtonBuilder } from '@/functions'
import { ActionRowBuilder, ButtonStyle, EmbedBuilder, TextChannel, codeBlock, type APIEmbed, type ButtonBuilder, type ButtonInteraction, type CacheType, type Message, type ModalSubmitInteraction } from 'discord.js'
import { type PaymentResponse } from 'mercadopago/dist/clients/payment/commonTypes'
import { type ProductCartData, type User, type cartData } from './interfaces'

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class updateCart {
  public static async embedAndButtons (options: {
    interaction: ButtonInteraction<CacheType> | ModalSubmitInteraction<CacheType>
    data: cartData
    channel?: TextChannel // Somente para a criação de um novo carrinho
    message?: Message<boolean> | null
    typeEdit?: 'update' | 'remover&update'
    paymentData?: PaymentResponse
    taxa?: number
  }): Promise<{
      main: {
        embeds: APIEmbed[]
        components: Array<ActionRowBuilder<ButtonBuilder>>
      }
      product: {
        embeds: APIEmbed[]
        components: Array<ActionRowBuilder<ButtonBuilder>>
      }
    }> {
    const { interaction, data, message, typeEdit, channel } = options
    const { typeEmbed, typeRedeem, products, user, properties } = data
    const { guildId, user: { id: userId }, channelId } = interaction
    const ctrlUrl = await db.payments.get(`${guildId}.config.ctrlPanel.url`)

    const paymentEmbeds: EmbedBuilder[] = []
    const paymentComponents = await this.typeButtons({ data })
    const productEmbeds: EmbedBuilder[] = []
    const productComponents: Array<ActionRowBuilder<ButtonBuilder>> = []

    const cartData = await db.payments.get(`${guildId}.process.${channel?.id ?? channelId}`) as cartData | undefined
    const mainMessageId = cartData?.messageId
    const cartChannelId = cartData?.channelId ?? data.channelId

    let setMessageId: string | undefined

    paymentEmbeds.push(...(await this.generateInfoEmbed({ products, user, typeEmbed, typeRedeem, discord: { userId, guildId } })))

    for (const product of products) {
      productEmbeds.push(this.generateProductEmbed(product))
      productComponents.push(await this.generateProductComponents({ product, properties }))
    }

    if (typeEmbed === 1) paymentComponents[0].components[2].setURL(ctrlUrl)
    if (message !== null && message !== undefined && channel?.id !== channelId) { // Caso venha de uma interação que já foi criada
      if (message.id === mainMessageId || channelId === cartChannelId) {
        if (typeEdit !== 'update') await message?.edit({ components: [] })
        const msg = await message.edit({
          embeds: paymentEmbeds,
          components: paymentComponents
        })
        setMessageId = msg.id
      }
    } if (cartChannelId !== undefined && mainMessageId !== undefined) { // Se a interação não vier de dentro do carrinho OU da embed principal
      const channelCart = await interaction.guild?.channels.fetch(cartChannelId)
      if (channelCart instanceof TextChannel) {
        const msg = await channelCart.messages.fetch(mainMessageId)
        await msg.edit({
          embeds: paymentEmbeds,
          components: paymentComponents
        })
        setMessageId = msg.id
      }
    } else if (channel !== undefined) { // Criação
      const msg = await channel.send({
        embeds: paymentEmbeds,
        components: paymentComponents
      })
      setMessageId = msg.id
    }
    if (setMessageId !== undefined) await db.payments.set(`${guildId}.process.${channel?.id ?? channelId}.messageId`, setMessageId)

    // Cria as embeds junto com os components de cada produto do carrinho
    if (typeEmbed === 0) {
      for (const [position, productEmbed] of productEmbeds.entries()) {
        const messageProductId = await db.payments.get(`${guildId}.process.${channel?.id ?? channelId}.products.${position}.messageId`) as string | undefined
        let messageId: string | undefined

        if (cartChannelId !== undefined && channel?.id !== channelId) {
          const channelCart = await interaction.guild?.channels.fetch(cartChannelId)
          if (channelCart instanceof TextChannel) {
            if (messageProductId !== undefined) {
              await channelCart.messages.fetch(String(messageProductId)).then(async (msg) => {
                await msg.edit({
                  embeds: [productEmbed.toJSON()],
                  components: [productComponents[position].toJSON()]
                })
              })
            } else {
              const msg = await channelCart?.send({
                embeds: [productEmbed.toJSON()],
                components: [productComponents[position].toJSON()]
              })
              messageId = msg.id
            }
          }
        } else {
          if (message !== undefined) {
            const msg = await message?.channel.send({
              embeds: [productEmbed.toJSON()],
              components: [productComponents[position].toJSON()]
            })
            if (msg !== undefined) messageId = msg.id
          } else if (channel !== undefined) {
            const msg = await channel?.send({
              embeds: [productEmbed.toJSON()],
              components: [productComponents[position].toJSON()]
            })
            messageId = msg.id
          }
        }
        if (messageId !== undefined) await db.payments.set(`${guildId}.process.${channel?.id ?? channelId}.products.${position}.messageId`, messageId)
      }
    }

    return {
      main: {
        embeds: paymentEmbeds.map((embed) => embed.toJSON()),
        components: paymentComponents
      },
      product: {
        embeds: productEmbeds.map((embed) => embed.toJSON()),
        components: productComponents
      }
    }
  }

  public static async generateInfoEmbed ({
    products,
    typeEmbed,
    typeRedeem,
    user,
    discord
  }: {
    products: ProductCartData[]
    typeEmbed: number
    typeRedeem?: number
    user?: User
    discord: {
      guildId: string | null
      userId: string
    }

  }): Promise<EmbedBuilder[]> {
    const valorTotal = products.reduce((allValue, product) => allValue + (product.quantity * product.amount), 0) ?? 0
    const coinsTotal: number = products.reduce((allCoins, product) => allCoins + (((product?.coins ?? 0) * product.quantity) ?? 0), 0) ?? 0
    const productTotal: number = products.reduce((allCount, product) => allCount + product.quantity, 0) ?? 0
    const embeds: EmbedBuilder[] = []
    let title
    let description
    let type

    if (typeEmbed === 0) {
      title = 'Checkout & Quantidade.'
      description = 'Selecione quantos produtos deseja no seu carrinho, e se quer aplicar algum cupom.'
    } else if (typeEmbed === 1) {
      title = 'Checkout & Envio.'
      description = `<@${discord.userId}> Confira as informações sobre os produtos e escolha a forma que deseja receber seus créditos:`
    } else if (typeEmbed === 2) {
      title = 'Checkout & Tipo de pagamento.'
      description = 'Confira as informações sobre os produtos e gere o link para o pagamento:'
    } else {
      title = 'Pagamento.'
      description = 'Realize o pagamento abaixo para adquirir o seu produto!'
    }
    if (typeRedeem === 1) {
      type = 'DM'
    } else if (typeRedeem === 2) {
      type = 'Direct'
    } else {
      type = 'Não selecionado.'
    }

    embeds.push(
      new EmbedBuilder({
        title,
        description,
        fields: [
          { name: '📦 Produtos:', value: (String(productTotal ?? 'Indefinido')) },
          { name: '🛒 Valor Total', value: `R$${valorTotal}` }
        ]
      }).setColor('Blue')
    )
    if (coinsTotal > 0) embeds[0].addFields({ name: '🪙 Créditos totais:', value: `${coinsTotal}` })
    if (typeEmbed > 1) embeds[0].addFields({ name: '✉️ Método de envio:', value: type })

    if (user !== undefined && typeEmbed !== 3 && typeEmbed !== 0) {
      embeds.push(
        new EmbedBuilder({
          title: 'Informações do Usuário',
          fields: [
            { name: '📧 E-mail:', value: user?.email ?? 'Indefinido' },
            { name: '🤝 Usuário:', value: user?.name ?? 'Indefinido' }
          ]
        }).setColor('Blue')
      )
    }

    if (typeEmbed === 2) {
      const { pix, debit_card: debit, credit_card: credit } = await db.payments.get(`${discord.guildId}.config.taxes`)
      embeds.push(
        new EmbedBuilder({
          title: 'Taxas dos Métodos de pagamento:',
          fields: [
            { name: '💠 PIX:', value: (pix ?? '1') + '%', inline: false },
            { name: '💳 Cartão de Débito:', value: (debit ?? '1.99') + '%', inline: false },
            { name: '💳 Cartão de Crédito:', value: (credit ?? '4.98') + '%', inline: false }
          ]
        }).setColor('Blue')
      )
    }

    return embeds
  }

  public static generateProductEmbed (product: ProductCartData): EmbedBuilder {
    const embed = new EmbedBuilder({
      title: product.name,
      fields: [
        { name: '💵 | Valor unitário:', value: `R$${(Math.round(product.amount * 100) / 100) ?? 'Error'}` },
        { name: '📦 | Quantidade:', value: `${product.quantity ?? 'Error'}` }
      ],
      footer: { text: `Product ID: ${product.id}` }
    }).setColor('Blue')

    if (product.quantity > 1) {
      embed.addFields(
        {
          name: '💰 | Valor total:',
          value: `R$${(Math.round(product.amount * 100) / 100) * product.quantity}`
        }
      )
    }

    if (product.coins !== undefined && product.coins > 0) {
      embed.addFields({ name: '🪙 | Créditos individuais:', value: String(product.coins), inline: product.quantity > 1 })
      if (product.quantity > 1) embed.addFields({ name: '💰 | Créditos total:', value: String(product.coins * product.quantity), inline: true })
    }

    return embed

    /*
    if ((typeEmbed === 0) || (product.cupom !== undefined)) {
      productEmbeds[productNow].addFields(
        {
          name: '🎫 Cupom:',
          value: typeof product.cupom?.name === 'string' ? `${product.cupom?.name} (${product.cupom?.porcent ?? 0}%)` : 'Indefinido',
          inline: true
        }
      )
    }
    */
  }

  public static async generateProductComponents ({
    product,
    properties
  }: {
    product: ProductCartData
    properties: Record<string, boolean> | undefined
  }): Promise<ActionRowBuilder<ButtonBuilder>> {
    const components = new ActionRowBuilder<ButtonBuilder>()
    const productComponents = [
      await CustomButtonBuilder.create({
        type: 'Cart',
        customId: 'Rem',
        disabled: product.quantity <= 1,
        emoji: '➖',
        style: ButtonStyle.Primary
      }),
      await CustomButtonBuilder.create({
        type: 'Cart',
        customId: 'Add',
        emoji: '➕',
        style: ButtonStyle.Primary
      }),
      await CustomButtonBuilder.create({
        type: 'Cart',
        customId: 'Cupom',
        disabled: properties?.cupom,
        emoji: '🎫',
        style: ButtonStyle.Primary
      }),
      await CustomButtonBuilder.create({
        type: 'Cart',
        customId: 'Remove',
        emoji: '✖️',
        style: ButtonStyle.Danger
      })
    ]
    return components.setComponents(productComponents)
  }

  public static async typeButtons (options: {
    data: cartData
  }): Promise<Array<ActionRowBuilder<ButtonBuilder>>> {
    const { data } = options
    const { typeEmbed: type } = data

    const Secondary = [
      await CustomButtonBuilder.create({
        type: 'Cart',
        customId: 'DM',
        label: 'Mensagem via DM',
        emoji: '💬',
        style: ButtonStyle.Success,
        disabled: true
      }),
      await CustomButtonBuilder.create({
        type: 'Cart',
        customId: 'Direct',
        label: 'Instantaneamente',
        emoji: '📲',
        style: ButtonStyle.Success
      }),
      await CustomButtonBuilder.create({
        type: 'Cart',
        url: 'https://google.com/',
        emoji: '🔗',
        style: ButtonStyle.Link
      })
    ]

    const Third = [
      await CustomButtonBuilder.create({
        type: 'Cart',
        customId: 'Pix',
        label: 'PIX',
        emoji: '💠',
        style: ButtonStyle.Success
      }),
      await CustomButtonBuilder.create({
        type: 'Cart',
        customId: 'CardDebito',
        label: 'Cartão de Débito',
        emoji: '💳',
        style: ButtonStyle.Success,
        disabled: true
      }),
      await CustomButtonBuilder.create({
        type: 'Cart',
        customId: 'CardCredito',
        label: 'Cartão de Crédito',
        emoji: '💳',
        style: ButtonStyle.Success,
        disabled: true
      })
    ]

    const Payment = [
      await CustomButtonBuilder.create({
        type: 'Cart',
        label: 'Pagar',
        url: 'https://www.mercadopago.com.br/',
        style: ButtonStyle.Link
      }),
      await CustomButtonBuilder.create({
        type: 'Cart',
        customId: 'Verify',
        label: 'Verificar Pagamento',
        emoji: '✔️',
        style: ButtonStyle.Success
      }),
      await CustomButtonBuilder.create({

        type: 'Cart',
        customId: 'Cancelar',
        label: 'Cancelar',
        emoji: '✖️',
        style: ButtonStyle.Danger
      })
    ]

    const headerBar = [
      await CustomButtonBuilder.create({
        type: 'Cart',
        customId: 'Before',
        label: 'Voltar',
        emoji: '⬅️',
        style: ButtonStyle.Secondary
      }),
      await CustomButtonBuilder.create({
        type: 'Cart',
        customId: 'Next',
        label: 'Proximo',
        emoji: '➡️',
        style: ButtonStyle.Success
      }),
      await CustomButtonBuilder.create({
        type: 'Cart',
        customId: 'WTF',
        label: 'Saiba Mais 🔔',
        emoji: '❔',
        style: ButtonStyle.Primary
      }),
      await CustomButtonBuilder.create({
        type: 'Cart',
        customId: 'Cancelar',
        label: 'Cancelar',
        emoji: '✖️',
        style: ButtonStyle.Danger
      })
    ]

    const components: Array<ActionRowBuilder<ButtonBuilder>> = []

    components[0] = new ActionRowBuilder()
    if (type === undefined || type <= 2) {
      if (type === 0 || type === undefined) {
        components[0].setComponents(...headerBar)
      } else if (type === 1) {
        components[1] = new ActionRowBuilder()
        components[0].setComponents(...Secondary)
        components[1].setComponents(...headerBar)
      } else if (type === 2) {
        components[1] = new ActionRowBuilder()
        components[0].setComponents(...Third)
        components[1].setComponents(...headerBar)
      }
    } else if (type === 3) {
      components[0].setComponents(...Payment)
    }

    const actions: Record<string, (options: {
      value: CustomButtonBuilder
      customId: string
      typeEmbed: number | undefined
      quantity?: number
      properties: Record<string, boolean> | undefined
      typeRedeem: number | undefined
    }) => void> = {
      Before: ({ value, typeEmbed }) => {
        if (typeEmbed === 0) value.setDisabled(true)
      },
      Next: ({ value, typeEmbed, typeRedeem }) => {
        if (typeEmbed !== undefined && (typeEmbed >= 2 || (typeEmbed === 1 && typeRedeem === undefined))) {
          value.setDisabled(true)
        }
      },
      WTF: ({ value, customId, typeEmbed, properties }) => {
        if (typeEmbed !== undefined && properties?.[`${customId}_${typeEmbed}`] === true) {
          value.setStyle(ButtonStyle.Secondary)
          value.setLabel('Saiba Mais')
        }
      },
      DM: ({ value, customId, typeRedeem, properties }) => {
        if (typeRedeem === 1 && properties?.[customId] === true) value.setDisabled(true)
      },
      Direct: ({ value, customId, typeRedeem, properties }) => {
        if (typeRedeem === 2 && properties?.[customId] === true) value.setDisabled(true)
      }
    }

    const allValues = [...headerBar, ...Secondary]

    for (const value of allValues) {
      const { customId } = value
      if (customId === undefined) continue

      const { typeEmbed, typeRedeem, properties } = data ?? {}

      if (typeof actions[customId] === 'function') {
        actions[customId]({ value, customId, typeEmbed, properties, typeRedeem })
      }
    }

    return components
  }

  public static async displayData (options: {
    interaction: ButtonInteraction<CacheType> | ModalSubmitInteraction<CacheType>
    data: cartData
    type?: 'editReply' | 'reply'
  }): Promise<void> {
    const { interaction, type, data } = options
    const embed = new EmbedBuilder({
      title: '⚙️ | Setado com sucesso!',
      description: 'Seus dados estão aqui, de forma limpa e justa.\nApos o pagamento/exclusão eles serão deletados.',
      fields: [
        {
          name: '📑 Dados:',
          value: codeBlock('json', JSON.stringify(data, null, 4))
        }
      ]
    }).setColor('Green')

    if (type === 'reply' || type === undefined) {
      await interaction.reply({
        ephemeral,
        embeds: [embed]
      })
    } else {
      await interaction.editReply({
        embeds: [embed]
      })
    }
  }
}
