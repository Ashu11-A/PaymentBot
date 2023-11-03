import { EmbedBuilder, type ButtonInteraction, type CacheType, ActionRowBuilder, ButtonBuilder, ButtonStyle, type Message, type ModalSubmitInteraction, codeBlock, type APIEmbed } from 'discord.js'
import { type cardData } from './interfaces'
import { db } from '@/app'
import { type PaymentResponse } from 'mercadopago/dist/clients/payment/commonTypes'

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class updateCard {
  public static async embedAndButtons (options: {
    interaction: ButtonInteraction<CacheType> | ModalSubmitInteraction<CacheType>
    data: cardData
    message?: Message<boolean>
    typeEdit?: 'update' | 'remover&update'
    paymentData?: PaymentResponse
    taxa?: number
  }): Promise<{ embeds: APIEmbed[], components: Array<ActionRowBuilder<ButtonBuilder>> }> {
    const { interaction, data, message, typeEdit, paymentData, taxa } = options
    const { typeEmbed, typeRedeem, cupom, coins, amount, quantity, product, user } = data
    const { guildId } = interaction
    const valor = Number(((typeof cupom?.porcent === 'number' ? (amount - (amount * cupom.porcent / 100)) : amount) * (quantity ?? 1)).toFixed(2))
    const valorPagamento = paymentData?.transaction_amount ?? paymentData?.additional_info?.items?.[0]?.unit_price ?? (valor * (quantity))
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

    const components = await this.buttons({
      data
    })

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
    data: cardData
  }): Promise<Array<ActionRowBuilder<ButtonBuilder>>> {
    const { data } = options
    const { typeEmbed: type } = data

    const Primary = [
      new ButtonBuilder({
        customId: 'paymentUserRem',
        emoji: '➖',
        style: ButtonStyle.Primary
      }),
      new ButtonBuilder({
        customId: 'paymentUserAdd',
        emoji: '➕',
        style: ButtonStyle.Primary
      }),
      new ButtonBuilder({
        customId: 'paymentUserCupom',
        label: 'Cupom',
        emoji: '🎫',
        style: ButtonStyle.Primary
      })
    ]

    const Secondary = [
      new ButtonBuilder({
        customId: 'paymentUserDM',
        label: 'Mensagem via DM',
        emoji: '💬',
        style: ButtonStyle.Primary,
        disabled: true
      }),
      new ButtonBuilder({
        customId: 'paymentUserDirect',
        label: 'Instantaneamente',
        emoji: '📲',
        style: ButtonStyle.Primary
      }),
      new ButtonBuilder({
        url: 'https://google.com/',
        emoji: '🔗',
        style: ButtonStyle.Link
      })
    ]

    const Third = [
      new ButtonBuilder({
        customId: 'paymentUserGerarPix',
        label: 'PIX',
        emoji: '💠',
        style: ButtonStyle.Success
      }),
      new ButtonBuilder({
        customId: 'paymentUserGerarCardDebito',
        label: 'Cartão de Débito',
        emoji: '💳',
        style: ButtonStyle.Success
      }),
      new ButtonBuilder({
        customId: 'paymentUserGerarCardCredito',
        label: 'Cartão de Crédito',
        emoji: '💳',
        style: ButtonStyle.Success
      })
    ]

    const Payment = [
      new ButtonBuilder({
        label: 'Pagar',
        url: 'https://www.mercadopago.com.br/',
        style: ButtonStyle.Link
      }),
      new ButtonBuilder({
        customId: 'paymentVerify',
        label: 'Verificar Pagamento',
        emoji: '✔️',
        style: ButtonStyle.Success
      }),
      new ButtonBuilder({
        customId: 'paymentUserCancelar',
        label: 'Cancelar',
        emoji: '✖️',
        style: ButtonStyle.Danger
      })
    ]

    const footerBar = [
      new ButtonBuilder({
        customId: 'paymentUserBefore',
        label: 'Voltar',
        emoji: '⬅️',
        style: ButtonStyle.Secondary
      }),
      new ButtonBuilder({
        customId: 'paymentUserNext',
        label: 'Proximo',
        emoji: '➡️',
        style: ButtonStyle.Success
      }),
      new ButtonBuilder({
        customId: 'paymentUserWTF',
        label: 'Saiba Mais 🔔',
        emoji: '❔',
        style: ButtonStyle.Primary
      }),
      new ButtonBuilder({
        customId: 'paymentUserCancelar',
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

    for (const value of footerBar) {
      const { custom_id: customID } = Object(value.toJSON())

      if (customID === 'paymentUserBefore' && data?.typeEmbed !== undefined && data.typeEmbed === 0) {
        value.setDisabled(true)
      }

      if (customID === 'paymentUserNext' && data?.typeEmbed !== undefined && data.typeEmbed >= 2) {
        value.setDisabled(true)
        value.setStyle(ButtonStyle.Secondary)
      }

      if (customID === 'paymentUserWTF' && data?.typeEmbed !== undefined && ((data?.properties?.[`${customID}_${data.typeEmbed}`]) === true)) {
        value.setStyle(ButtonStyle.Secondary)
        value.setLabel('Saiba Mais')
      }
    }

    for (const value of Primary) {
      const { custom_id: customID } = Object(value.toJSON())

      if (customID === 'paymentUserRem' && data?.quantity !== undefined && data.quantity <= 1) {
        value.setDisabled(true)
      }

      if (customID === 'paymentUserCupom' && ((data?.properties?.cupom) === true)) {
        value.setDisabled(true)
      }
    }

    for (const value of Secondary) {
      const { custom_id: customID } = Object(value.toJSON())

      if (customID === 'paymentUserDM' && data?.typeRedeem === 1 && data?.properties?.[customID] === true) {
        value.setDisabled(true)
      }
      if (customID === 'paymentUserDirect' && data?.typeRedeem === 2 && data?.properties?.[customID] === true) {
        value.setDisabled(true)
      }
    }

    return components
  }

  public static async displayData (options: {
    interaction: ButtonInteraction<CacheType> | ModalSubmitInteraction<CacheType>
    data: cardData
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
