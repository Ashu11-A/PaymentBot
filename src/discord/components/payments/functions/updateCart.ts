import { db } from '@/app'
import { CustomButtonBuilder } from '@/functions'
import { ActionRowBuilder, ButtonStyle, EmbedBuilder, codeBlock, type APIEmbed, type ButtonBuilder, type ButtonInteraction, type CacheType, type Message, type ModalSubmitInteraction } from 'discord.js'
import { type PaymentResponse } from 'mercadopago/dist/clients/payment/commonTypes'
import { type cartData } from './interfaces'

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class updateCart {
  public static async embedAndButtons (options: {
    interaction: ButtonInteraction<CacheType> | ModalSubmitInteraction<CacheType>
    data: cartData
    message?: Message<boolean>
    typeEdit?: 'update' | 'remover&update'
    paymentData?: PaymentResponse
    taxa?: number
  }): Promise<{ embeds: APIEmbed[], components: Array<ActionRowBuilder<ButtonBuilder>> }> {
    const { interaction, data, message, typeEdit, paymentData, taxa } = options
    const { typeEmbed, typeRedeem, cupom, coins, amount, quantity, product, user } = data
    const { guildId } = interaction
    const valor = Number(((typeof cupom?.porcent === 'number' ? (amount - (amount * cupom.porcent / 100)) : amount) * (quantity ?? 1)).toFixed(2))
    const valorPagamento = paymentData?.transaction_amount ?? paymentData?.additional_info?.items?.[0]?.unit_price ?? valor
    const ctrlUrl = await db.payments.get(`${guildId}.config.ctrlPanel.url`)

    let titulo
    let descrição
    let type

    if (typeEmbed === 0 || typeEmbed === undefined) {
      titulo = 'Checkout & Quantidade.'
      descrição = 'Selecione quantos produtos deseja no seu carrinho, e se quer aplicar algum cupom.'
    } else if (typeEmbed === 1 || typeEmbed === undefined) {
      titulo = 'Checkout & Envio.'
      descrição = `<@${interaction?.user.id}> Confira as informações sobre os produtos e escolha a forma que deseja receber seus créditos:`
    } else if (typeEmbed === 2) {
      titulo = 'Checkout & Tipo de pagamento.'
      descrição = 'Confira as informações sobre os produtos e gere o link para o pagamento:'
    } else {
      titulo = 'Pagamento.'
      descrição = 'Realize o pagamento abaixo para adquirir o seu produto!'
    }
    if (typeRedeem === 1) {
      type = 'DM'
    } else if (typeRedeem === 2) {
      type = 'Direct'
    } else {
      type = 'Não selecionado.'
    }

    const mainEmbed = new EmbedBuilder({
      title: titulo,
      description: descrição
    }).setColor('LightGrey')

    const infoPayment = new EmbedBuilder({
      title: 'Informações do Pedido',
      fields: [
        {
          name: 'Produto:',
          value: (product ?? 'Indefinido'),
          inline: false
        },
        {
          name: '**💰 Valor unitário:**',
          value: `R$${amount}`,
          inline: true
        },
        {
          name: '**📦 Quantidade:**',
          value: `${quantity}`,
          inline: true
        },
        {
          name: '\u200b',
          value: '\u200b',
          inline: true
        },
        {
          name: `**🛒 Valor Total ${typeof cupom?.porcent === 'number' ? '(Desconto incluso)' : '(Taxas não inclusas)'}:**`,
          value: `R$${valor}`,
          inline: true
        },
        {
          name: '**🍃 Taxas:**',
          value: `R$${(valorPagamento - valor).toFixed(2)} (${taxa ?? 0}%)`,
          inline: true
        },
        {
          name: '\u200b',
          value: '\u200b',
          inline: true
        },
        {
          name: '**✉️ Método de envio:**',
          value: type
        }
      ]
    }).setColor('LightGrey')

    if ((typeEmbed === 0) || (cupom?.name !== undefined)) {
      infoPayment.addFields(
        {
          name: '**🎫 Cupom:**',
          value: typeof cupom?.name === 'string' ? `${cupom.name} (${cupom?.porcent ?? 0}%)` : 'Indefinido'
        }
      )
    }

    if (coins !== undefined) {
      infoPayment.addFields(
        {
          name: '**🪙 Créditos totais:**',
          value: `${(coins * quantity) ?? 'Indefinido'}`
        }
      )
    }

    const embedsPayment = [mainEmbed, infoPayment]
    if (user !== undefined && typeEmbed !== 3) {
      const userEmbed = new EmbedBuilder()
        .setColor('LightGrey')
        .setTitle('Informações do Usuário')
        .addFields(
          {
            name: '**📧 E-mail:**',
            value: user?.email ?? 'Indefinido',
            inline: false
          },
          {
            name: '**🤝 Usuário:**',
            value: user?.name ?? 'Indefinido',
            inline: false
          }
        )

      embedsPayment.push(userEmbed)
    }
    const { pix, debit_card: debit, credit_card: credit } = await db.payments.get(`${guildId}.config.taxes`)
    if (typeEmbed === 2) {
      const infoTax = new EmbedBuilder({
        title: 'Taxas dos Métodos de pagamento:',
        fields: [
          { name: '**💠 PIX:**', value: (pix ?? '1') + '%', inline: false },
          { name: '**💳 Cartão de Débito:**', value: (debit ?? '1.99') + '%', inline: false },
          { name: '**💳 Cartão de Crédito:**', value: (credit ?? '4.98') + '%', inline: false }
        ]
      })
        .setColor('LightGrey')
      embedsPayment.push(infoTax)
    }

    const components = await this.buttons({ data })

    const embeds = embedsPayment.map((embedBuilder) =>
      embedBuilder.toJSON()
    )

    if (typeEmbed === 1) {
      components[0].components[2].setURL(ctrlUrl)
    }

    if (message !== undefined) {
      if (typeEdit === 'update') {
        await message.edit({ embeds, components })
      } else {
        await message.edit({ components: [] })
        await message.edit({ embeds, components })
      }
    }
    return { embeds, components }
  }

  public static async buttons (options: {
    data: cartData
  }): Promise<Array<ActionRowBuilder<ButtonBuilder>>> {
    const { data } = options
    const { typeEmbed: type } = data

    const Primary = [
      await CustomButtonBuilder.create({
        type: 'Cart',
        customId: 'Rem',
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
        label: 'Cupom',
        emoji: '🎫',
        style: ButtonStyle.Primary
      })
    ]

    const Secondary = [
      await CustomButtonBuilder.create({
        type: 'Cart',
        customId: 'DM',
        label: 'Mensagem via DM',
        emoji: '💬',
        style: ButtonStyle.Primary,
        disabled: true
      }),
      await CustomButtonBuilder.create({

        type: 'Cart',
        customId: 'Direct',
        label: 'Instantaneamente',
        emoji: '📲',
        style: ButtonStyle.Primary
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

    const footerBar = [
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
      components[1] = new ActionRowBuilder()

      if (type === 0 || type === undefined) {
        components[0].setComponents(...Primary)
        components[1].setComponents(...footerBar)
      } else if (type === 1) {
        components[0].setComponents(...Secondary)
        components[1].setComponents(...footerBar)
      } else if (type === 2) {
        components[0].setComponents(...Third)
        components[1].setComponents(...footerBar)
      }
    } else if (type === 3) {
      components[0].setComponents(...Payment)
    }

    const actions: Record<string, (options: {
      value: CustomButtonBuilder
      customId: string
      typeEmbed: number | undefined
      quantity: number
      properties: Record<string, boolean> | undefined
      typeRedeem: number | undefined
    }) => void> = {
      Before: ({ value, typeEmbed }) => {
        if (typeEmbed === 0) value.setDisabled(true)
      },
      Next: ({ value, typeEmbed }) => {
        if (typeEmbed !== undefined && typeEmbed >= 2) {
          value.setDisabled(true)
          value.setStyle(ButtonStyle.Secondary)
        }
      },
      WTF: ({ value, customId, typeEmbed, properties }) => {
        if (typeEmbed !== undefined && properties?.[`${customId}_${typeEmbed}`] === true) {
          value.setStyle(ButtonStyle.Secondary)
          value.setLabel('Saiba Mais')
        }
      },
      Rem: ({ value, quantity }) => {
        if (quantity <= 1) value.setDisabled(true)
      },
      Cupom: ({ value, properties }) => {
        if (properties?.cupom === true) value.setDisabled(true)
      },
      DM: ({ value, customId, typeRedeem, properties }) => {
        if (typeRedeem === 1 && properties?.[customId] === true) value.setDisabled(true)
      },
      Direct: ({ value, customId, typeRedeem, properties }) => {
        if (typeRedeem === 2 && properties?.[customId] === true) value.setDisabled(true)
      }
    }

    const allValues = [...footerBar, ...Primary, ...Secondary]

    for (const value of allValues) {
      const { customId } = value
      if (customId === undefined) continue
      const typeEmbed = data?.typeEmbed
      const typeRedeem = data?.typeRedeem
      const quantity = data?.quantity
      const properties = data?.properties

      if (typeof actions[customId] === 'function') {
        actions[customId]({ value, customId, typeEmbed, quantity, properties, typeRedeem })
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
