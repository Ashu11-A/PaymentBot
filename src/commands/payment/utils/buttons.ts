import { db } from '@/app'
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, type Message, type CommandInteraction, type CacheType, type ModalSubmitInteraction, type ButtonInteraction } from 'discord.js'

export async function buttonsConfig (interaction: CommandInteraction<'cached'> | ModalSubmitInteraction<CacheType> | ButtonInteraction<CacheType>, message: Message<boolean>): Promise<void> {
  const { guildId, channelId } = interaction
  const row1Buttons = [
    new ButtonBuilder()
      .setCustomId('paymentSetName')
      .setLabel('Nome')
      .setEmoji('📝'),
    new ButtonBuilder()
      .setCustomId('paymentSetDesc')
      .setLabel('Descrição')
      .setEmoji('📑'),
    new ButtonBuilder()
      .setCustomId('paymentSetPrice')
      .setLabel('Preço')
      .setEmoji('💰'),
    new ButtonBuilder()
      .setCustomId('paymentSetMiniature')
      .setLabel('Miniatura')
      .setEmoji('🖼️'),
    new ButtonBuilder()
      .setCustomId('paymentSetBanner')
      .setLabel('Banner')
      .setEmoji('🌄')
  ]

  const row2Buttons = [
    new ButtonBuilder()
      .setCustomId('paymentSetColor')
      .setLabel('Cor')
      .setEmoji('🎨'),
    new ButtonBuilder()
      .setCustomId('paymentSetRole')
      .setLabel('Add Cargo')
      .setEmoji('🛂')
  ]

  const row3Buttons = [
    new ButtonBuilder()
      .setCustomId('paymentDelete')
      .setLabel('Apagar Produto')
      .setStyle(ButtonStyle.Danger)
      .setEmoji('✖️'),
    new ButtonBuilder()
      .setCustomId('paymentSave')
      .setLabel('Salvar')
      .setStyle(ButtonStyle.Success)
      .setEmoji('✔️')
  ]

  const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(...row1Buttons)
  const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(...row2Buttons)
  const row3 = new ActionRowBuilder<ButtonBuilder>().addComponents(...row3Buttons)

  for (const value of row1Buttons) {
    const { custom_id: customID } = Object(value.toJSON())
    const result = await db.payments.get(`${guildId}.channels.${channelId}.messages.${message.id}.properties.${customID}`)
    if (result !== undefined) {
      value.setStyle(ButtonStyle.Primary)
    } else {
      value.setStyle(ButtonStyle.Secondary)
    }
  }

  for (const value of row2Buttons) {
    const { custom_id: customID } = Object(value.toJSON())
    const result = await db.payments.get(`${guildId}.channels.${channelId}.messages.${message.id}.properties.${customID}`)
    if (result !== undefined) {
      value.setStyle(ButtonStyle.Primary)
    } else {
      value.setStyle(ButtonStyle.Secondary)
    }
  }

  const clearData = { components: [] }
  await message.edit({ ...clearData })

  await message.edit({ components: [row1, row2, row3] })
}

export async function buttonsUsers (interaction: CommandInteraction<'cached'> | ButtonInteraction<CacheType>, message: Message<boolean>): Promise<void> {
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

  const clearData = { components: [] }

  await message.edit({ ...clearData })

  await message.edit({ components: [row1] })
}
