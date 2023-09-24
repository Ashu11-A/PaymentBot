import { db } from '@/app'
import { createRowEdit } from '@/discord/events/SUEE/utils/createRowEdit'
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, type Message, type CommandInteraction, type CacheType, type ModalSubmitInteraction, type ButtonInteraction } from 'discord.js'

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class updateProduct {
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
        customId: 'paymentAddtCtrlPanelCoins',
        label: 'Moedas',
        emoji: '🪙',
        style: ButtonStyle.Secondary,
        disabled: true
      })
    ]

    const footerBar = [
      new ButtonBuilder()
        .setCustomId('paymentSave')
        .setLabel('Salvar')
        .setStyle(ButtonStyle.Success)
        .setEmoji('✔️'),
      new ButtonBuilder()
        .setCustomId('paymentStatus')
        .setLabel('Ativar/Desativar'),
      new ButtonBuilder()
        .setCustomId('paymentDelete')
        .setLabel('Apagar Produto')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('✖️')
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
      if (customID === 'paymentAddtCtrlPanelCoins' && data?.properties !== undefined && data.properties?.paymentSetCtrlPanel === true) {
        value.setDisabled(false)
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
