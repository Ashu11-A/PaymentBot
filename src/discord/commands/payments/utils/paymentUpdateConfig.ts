import { db } from '@/app'
import { createRowEdit } from '@/discord/events/SUEE/utils/createRowEdit'
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, type Message, type CommandInteraction, type CacheType, type ModalSubmitInteraction, type ButtonInteraction } from 'discord.js'

export async function paymentButtonsConfig (interaction: CommandInteraction<'cached'> | ModalSubmitInteraction<CacheType> | ButtonInteraction<CacheType>, message: Message<boolean>): Promise<void> {
  const { guildId, channelId } = interaction

  const [row1] = await createRowEdit(interaction, message, 'payments')

  const row2Buttons = [
    new ButtonBuilder()
      .setCustomId('paymentSetPrice')
      .setLabel('Preço')
      .setEmoji('💰'),
    new ButtonBuilder()
      .setCustomId('paymentSetRole')
      .setLabel('Add Cargo')
      .setEmoji('🛂')
  ]

  const row3Buttons = [
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

  const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(...row2Buttons)
  const row3 = new ActionRowBuilder<ButtonBuilder>().addComponents(...row3Buttons)

  for (const value of row2Buttons) {
    const { custom_id: customID } = Object(value.toJSON())
    const { properties } = await db.messages.get(`${guildId}.payments.${channelId}.messages.${message.id}`)
    if (properties !== undefined && properties[customID] !== undefined) {
      value.setStyle(ButtonStyle.Primary)
    } else {
      value.setStyle(ButtonStyle.Secondary)
    }
  }

  for (const value of row3Buttons) {
    const { custom_id: customID } = Object(value.toJSON())
    if (customID === 'paymentStatus') {
      const { status } = await db.messages.get(`${guildId}.payments.${channelId}.messages.${message.id}`)

      if (status !== undefined && status === true) {
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

  await message.edit({ components: [row1, row2, row3] })
}

export async function buttonsUsers (interaction: CommandInteraction<'cached'> | ButtonInteraction<CacheType>, message: Message<boolean>): Promise<void> {
  const { guildId, channelId } = interaction
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
      const { status } = await db.messages.get(`${guildId}.payments.${channelId}.messages.${message.id}`)

      if (status !== undefined && status === true) {
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
