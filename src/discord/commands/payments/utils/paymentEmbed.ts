import { EmbedBuilder, type ButtonInteraction, type CacheType, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js'

interface Data {
  creditos: number
  amount: number
  typeRedeem: string
  cupom: {
    name: string
    porcent: number
    cupomAmount: number
  }
  fields: Array<{ value: string }>
}

interface User {
  name: string
  email: string
  credits: number
}

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class paymentEmbed {
  public static async TypeRedeem (options: {
    interaction: ButtonInteraction<CacheType>
    typeEmbed?: number
    data?: Data
    user?: User
  }): Promise<{ rEmbeds: EmbedBuilder[], rComponents: Array<ActionRowBuilder<ButtonBuilder>> }> {
    const { interaction, data, typeEmbed, user } = options

    console.log(data, typeEmbed, user)
    let titulo
    let descrição

    if (typeEmbed === 1 || typeEmbed === undefined) {
      titulo = 'Checkout e Envio'
      descrição = `<@${interaction?.user.id}> Confira as informações sobre os produtos e escolha a forma que deseja receber seus créditos:`
    } else if (typeEmbed === 2) {
      titulo = 'Checkout e Pagamento'
      descrição = 'Confira as informações sobre os produtos e gere o link para o pagamento:'
    }

    const mainEmbed = new EmbedBuilder()
      .setColor('LightGrey')
      .setTitle(titulo ?? 'Indefinido')
      .setDescription(descrição ?? 'Indefinido')

    const infoPayment = new EmbedBuilder()
      .setColor('LightGrey')
      .setTitle('Informações do Pagamento')
      .addFields(
        {
          name: '**💰 Valor (sem taxas):**',
          value: `R$${data?.cupom?.cupomAmount ?? data?.amount ?? data?.fields[0]?.value ?? 'Indefinido'}`
        },
        {
          name: '**🎫 Cupom:**',
          value: `${data?.cupom?.name ?? 'Indefinido'} (${
              data?.cupom?.porcent ?? '0'
            }%)`
        },
        {
          name: '**🪙 Créditos totais:**',
          value: `${data?.creditos ?? 'Indefinido'}`
        },
        {
          name: '**✉️ Método de envio:**',
          value: `${data?.typeRedeem ?? 'Indefinido'}`
        }
      )

    const embeds = [mainEmbed, infoPayment]

    if (user !== undefined) {
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
          },
          {
            name: '**💳 Créditos atuais:**',
            value: user?.credits?.toFixed(2) ?? 'Indefinido',
            inline: false
          }
        )

      embeds.push(userEmbed)
    }

    if (typeEmbed === 2) {
      const infoTax = new EmbedBuilder()
        .setColor('LightGrey')
        .setTitle('Taxas dos Métodos de pagamento:')
        .addFields(
          { name: '**💠 PIX:**', value: '1%', inline: false },
          { name: '**💳 Cartão de Débito:**', value: '1.99%', inline: false },
          { name: '**💳 Cartão de Crédito:**', value: '4.98%', inline: false }
        )
      embeds.push(infoTax)
    }

    const components = await paymentEmbed.ButtonEmbed({
      type: typeEmbed
    })

    console.log(embeds)
    return { rEmbeds: embeds, rComponents: components }
  }

  public static async ButtonEmbed (options: {
    interaction?: ButtonInteraction<CacheType>
    type?: number
  }): Promise<Array<ActionRowBuilder<ButtonBuilder>>> {
    const { type } = options

    const row1Buttons = [
      new ButtonBuilder()
        .setEmoji({ name: '💬' })
        .setLabel('Mensagem via DM')
        .setCustomId('DM')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setEmoji({ name: '📲' })
        .setCustomId('Direct')
        .setLabel('Diretamente ao Dash')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setEmoji({ name: '🔗' })
        .setLabel('Dashboard')
        .setURL('https://dash.seventyhost.net/')
        .setStyle(ButtonStyle.Link)
    ]

    const row2Buttons = [
      new ButtonBuilder()
        .setEmoji({ name: '🎫' })
        .setCustomId('cupom')
        .setLabel('Cupom')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setEmoji({ name: '➕' })
        .setCustomId('WTF')
        .setLabel('Saiba Mais')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setEmoji({ name: '✖️' })
        .setCustomId('cancelarType')
        .setLabel('Cancelar')
        .setStyle(ButtonStyle.Danger)
    ]

    const row3Buttons = [
      new ButtonBuilder()
        .setEmoji({ name: '💠' })
        .setLabel('PIX')
        .setCustomId('gerar-pix')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setEmoji({ name: '💳' })
        .setLabel('Cartão de Débito')
        .setCustomId('gerar-card-debito')
        .setStyle(ButtonStyle.Success)
    ]

    const row4Buttons = [
      new ButtonBuilder()
        .setEmoji({ name: '💳' })
        .setLabel('Cartão de Crédito')
        .setCustomId('gerar-card-credito')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setEmoji({ name: '✖️' })
        .setCustomId('cancelarType')
        .setLabel('Cancelar')
        .setStyle(ButtonStyle.Danger)
    ]

    const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(...row1Buttons)
    const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(...row2Buttons)
    const row3 = new ActionRowBuilder<ButtonBuilder>().addComponents(...row3Buttons)
    const row4 = new ActionRowBuilder<ButtonBuilder>().addComponents(...row4Buttons)

    if (type === 1 && type !== undefined) {
      return [row1, row2]
    } else if (type === 2) {
      return [row3, row4]
    }

    return []
  }
}
