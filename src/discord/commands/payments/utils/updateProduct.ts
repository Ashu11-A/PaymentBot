import { db } from '@/app'
import { createRowEdit } from '@/discord/events/SUEE/utils/createRowEdit'
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, type Message, type CommandInteraction, type CacheType, type ModalSubmitInteraction, type ButtonInteraction, EmbedBuilder } from 'discord.js'

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class updateProduct {
  /**
   * Atualiza/Cria os botões de configuração do Produto
   */
  public static async embed (options: {
    interaction: ModalSubmitInteraction<CacheType> | ButtonInteraction<CacheType>
    message: Message<boolean>
  }): Promise<void> {
    const { interaction, message } = options
    const { guildId, channelId, customId } = interaction
    const data = await db.messages.get(`${guildId}.payments.${channelId}.messages.${message?.id}`)
    const updateEmbed = new EmbedBuilder(data?.embed)

    if (data?.price !== undefined && data.price !== '') {
      updateEmbed.addFields(
        {
          name: '💵 | Preço:',
          value: `R$${data.price}`
        }
      )
    }
    if (data?.coins !== undefined && data.coins !== '') {
      updateEmbed.addFields({
        name: '🪙 | Coins:',
        value: data.coins
      })
    }

    if (data?.role !== undefined && data.role !== '') {
      updateEmbed.addFields({
        name: '🛂 | Você receberá o cargo:',
        value: `<@&${data.role}>`
      })
    }

    if (data?.embed !== undefined) {
      if (data.embed?.color !== undefined && typeof data.embed?.color === 'string') {
        if (data.embed.color?.startsWith('#') === true) {
          updateEmbed.setColor(parseInt(data.embed.color.slice(1), 16))
        }
      }
    }

    await message.edit({ embeds: [updateEmbed] })
      .then(async () => {
        await db.messages.set(`${guildId}.payments.${channelId}.messages.${message?.id}.properties.${customId}`, true)
          .then(async () => {
            await updateProduct.buttonsConfig({
              interaction,
              message
            })
          })
      })
  }

  /**
   * Atualiza/Cria os botões de configuração do Produto
   */
  public static async buttonsConfig (options: {
    interaction: CommandInteraction<'cached'> | ModalSubmitInteraction<CacheType> | ButtonInteraction<CacheType>
    message: Message<boolean>
  }): Promise<void> {
    const { interaction, message } = options
    const { guildId, channelId } = interaction
    const data = await db.messages.get(`${guildId}.payments.${channelId}.messages.${message.id}`)

    const [row1] = await createRowEdit(interaction, message, 'payments')

    const row2Buttons = [
      new ButtonBuilder({
        customId: 'paymentSetPrice',
        label: 'Preço',
        emoji: '💰'
      }),
      new ButtonBuilder({
        customId: 'paymentSetRole',
        label: 'Add Cargo',
        emoji: '🛂'
      }),
      new ButtonBuilder({
        customId: 'paymentExport',
        label: 'Exportar',
        emoji: '📤'
      }),
      new ButtonBuilder({
        customId: 'paymentImport',
        label: 'Importar',
        emoji: '📥'
      })
    ]

    const redeemSystem = [
      new ButtonBuilder({
        customId: 'paymentSetEstoque',
        label: 'Estoque',
        emoji: '🗃️',
        style: ButtonStyle.Secondary
      }),
      new ButtonBuilder({
        customId: 'paymentAddEstoque',
        label: 'Add Estoque',
        emoji: '➕',
        style: ButtonStyle.Secondary,
        disabled: true
      }),
      new ButtonBuilder({
        customId: 'paymentSetCtrlPanel',
        label: 'CrtlPanel',
        emoji: '💻',
        style: ButtonStyle.Secondary
      }),
      new ButtonBuilder({
        customId: 'paymentAddCoins',
        label: 'Moedas',
        emoji: '🪙',
        style: ButtonStyle.Secondary,
        disabled: true
      })
    ]

    const footerBar = [
      new ButtonBuilder({
        customId: 'paymentSave',
        label: 'Salvar',
        emoji: '✔️',
        style: ButtonStyle.Success
      }),
      new ButtonBuilder({
        customId: 'paymentStatus',
        label: 'Ativar/Desativar'
      }),
      new ButtonBuilder({
        customId: 'paymentDelete',
        label: 'Apagar Produto',
        emoji: '✖️',
        style: ButtonStyle.Danger
      })
    ]

    const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(...redeemSystem)
    const row3 = new ActionRowBuilder<ButtonBuilder>().addComponents(...row2Buttons)
    const row4 = new ActionRowBuilder<ButtonBuilder>().addComponents(...footerBar)

    for (const value of redeemSystem) {
      const { custom_id: customID } = Object(value.toJSON())
      if (data?.properties !== undefined && data.properties[customID] !== undefined && data.properties[customID] === true) {
        value.setStyle(ButtonStyle.Primary)
      } else {
        value.setStyle(ButtonStyle.Secondary)
      }

      if (customID === 'paymentAddEstoque' && data?.properties !== undefined && data.properties?.paymentSetEstoque === true) {
        value.setDisabled(false)
      }
      if (customID === 'paymentAddCoins' && data?.properties !== undefined && data.properties?.paymentSetCtrlPanel === true) {
        value.setDisabled(false)
        if (data?.coins !== undefined && data?.coins !== '') {
          value.setStyle(ButtonStyle.Primary)
        } else {
          value.setStyle(ButtonStyle.Secondary)
        }
      }
    }

    for (const value of row2Buttons) {
      const { custom_id: customID } = Object(value.toJSON())
      if (data?.properties !== undefined && data.properties[customID] !== undefined) {
        value.setStyle(ButtonStyle.Primary)
      } else {
        value.setStyle(ButtonStyle.Secondary)
      }
    }

    for (const value of footerBar) {
      const { custom_id: customID } = Object(value.toJSON())
      if (customID === 'paymentStatus') {
        if (data?.status !== undefined && data?.status === true) {
          value.setLabel('Desativar')
          value.setStyle(ButtonStyle.Secondary)
        } else {
          value.setLabel('Ativar')
          value.setStyle(ButtonStyle.Primary)
        }
      }
    }

    const clearData = { components: [] }
    await message.edit({ ...clearData })

    await message.edit({ components: [row1, row2, row3, row4] })
  }

  /**
   * Muda os botões para os usuários (Modo Produção)
   */
  public static async buttonsUsers (options: {
    interaction: CommandInteraction<'cached'> | ButtonInteraction<CacheType>
    message: Message<boolean>
  }): Promise<void> {
    const { interaction, message } = options
    const { guildId, channelId } = interaction
    const data = await db.messages.get(`${guildId}.payments.${channelId}.messages.${message.id}`)

    const row1Buttons = [
      new ButtonBuilder()
        .setCustomId('paymentBuy')
        .setLabel('Adicionar ao Carrinho')
        .setStyle(ButtonStyle.Success)
        .setEmoji('🛒'),
      new ButtonBuilder()
        .setCustomId('paymentConfig')
        .setStyle(ButtonStyle.Secondary)
        .setLabel('⚙️')
    ]

    const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(...row1Buttons)

    for (const value of row1Buttons) {
      const { custom_id: customID } = Object(value.toJSON())
      if (customID === 'paymentBuy') {
        if (data?.status !== undefined && data.status === true) {
          value.setDisabled(false)
        } else {
          value.setDisabled(true)
        }
      }
    }

    const clearData = { components: [] }

    await message.edit({ ...clearData })

    await message.edit({ components: [row1] })
  }
}
