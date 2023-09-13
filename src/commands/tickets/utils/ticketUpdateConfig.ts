import { db } from '@/app'
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, type Message, type CommandInteraction, type CacheType, type ModalSubmitInteraction, type ButtonInteraction, StringSelectMenuBuilder } from 'discord.js'

export async function buttonsConfig (interaction: CommandInteraction<'cached'> | ModalSubmitInteraction<CacheType> | ButtonInteraction<CacheType> | CommandInteraction<CacheType>, message: Message<boolean>): Promise<void> {
  const { guildId, channelId } = interaction
  const row1Buttons = [
    new ButtonBuilder()
      .setCustomId('ticketSetName')
      .setLabel('Nome')
      .setEmoji('📝'),
    new ButtonBuilder()
      .setCustomId('ticketSetDesc')
      .setLabel('Descrição')
      .setEmoji('📑'),
    new ButtonBuilder()
      .setCustomId('ticketSetMiniature')
      .setLabel('Miniatura')
      .setEmoji('🖼️'),
    new ButtonBuilder()
      .setCustomId('ticketSetBanner')
      .setLabel('Banner')
      .setEmoji('🌄'),
    new ButtonBuilder()
      .setCustomId('ticketSetColor')
      .setLabel('Cor')
      .setEmoji('🎨')
  ]

  const row2Buttons = [
    new ButtonBuilder()
      .setCustomId('ticketSetRole')
      .setLabel('Add Cargo')
      .setEmoji('🛂'),
    new ButtonBuilder()
      .setCustomId('ticketSetSelect')
      .setLabel('SelectMenu')
      .setEmoji('🗄️'),
    new ButtonBuilder()
      .setCustomId('ticketAddSelect')
      .setLabel('Add Select')
      .setDisabled(true)
      .setEmoji('📝'),
    new ButtonBuilder()
      .setCustomId('ticketRemSelect')
      .setLabel('Rem Select')
      .setDisabled(true)
      .setEmoji('🗑️'),
    new ButtonBuilder()
      .setCustomId('ticketSetButton')
      .setLabel('Botão')
      .setEmoji('🔘')
  ]

  const row3Buttons = [
    new ButtonBuilder()
      .setCustomId('ticketSave')
      .setLabel('Salvar')
      .setStyle(ButtonStyle.Success)
      .setEmoji('✔️'),
    new ButtonBuilder()
      .setCustomId('ticketDelete')
      .setLabel('Apagar')
      .setStyle(ButtonStyle.Danger)
      .setEmoji('✖️')
  ]

  const dataDB = await db.guilds.get(`${guildId}.ticket.${channelId}.messages.${message?.id}.select`)
  const options: Array<{ label: string, description: string, value: string, emoji: string }> = []

  console.log(dataDB)

  let number = 0
  if (dataDB !== undefined) {
    dataDB.forEach(({ title, description }: { title: string, description: string }) => {
      console.log(`Title: ${title}`)
      console.log(`Description: ${description}`)
      // You can also push them into an options array if needed
      options.push({
        label: title,
        description,
        value: String(number), // You can set this value as needed
        emoji: '😩'
      })
      number += 1
    })
  }

  const selectRow = new ActionRowBuilder<StringSelectMenuBuilder>({
    components: [
      new StringSelectMenuBuilder({
        custom_id: 'ticketRowSelect',
        placeholder: 'Escolha qual tipo de ticket deseja abrir!',
        options
      })
    ]
  })

  const botao = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId('ticketOpen')
      .setEmoji({ name: '📩' })
      .setLabel('Abra seu ticket')
      .setStyle(ButtonStyle.Success)
  )

  const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(...row1Buttons)
  const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(...row2Buttons)
  const row3 = new ActionRowBuilder<ButtonBuilder>().addComponents(...row3Buttons)

  for (const value of row1Buttons) {
    const { custom_id: customID } = Object(value.toJSON())
    const result = await db.guilds.get(`${guildId}.ticket.${channelId}.messages.${message.id}.properties.${customID}`)
    if (result !== undefined) {
      value.setStyle(ButtonStyle.Primary)
    } else {
      value.setStyle(ButtonStyle.Secondary)
    }
  }

  for (const value of row2Buttons) {
    const { custom_id: customID } = Object(value.toJSON())
    const result = await db.guilds.get(`${guildId}.ticket.${channelId}.messages.${message.id}.properties.${customID}`)

    if (customID === 'ticketAddSelect' || customID === 'ticketRemSelect') {
      const enabled = await db.guilds.get(`${guildId}.ticket.${channelId}.messages.${message.id}.properties.ticketSetSelect`)
      if (enabled !== undefined && enabled === true) {
        value.setDisabled(false)
      } else {
        value.setDisabled(true)
      }
    }

    if (result !== undefined && result === true) {
      value.setStyle(ButtonStyle.Primary)
    } else {
      value.setStyle(ButtonStyle.Secondary)
    }
  }

  const clearData = { components: [] }
  await message.edit({ ...clearData })

  const select = await db.guilds.get(`${guildId}.ticket.${channelId}.messages.${message.id}.properties.ticketSetSelect`)
  const button = await db.guilds.get(`${guildId}.ticket.${channelId}.messages.${message.id}.properties.ticketSetButton`)

  console.log('select', select, 'button', button)

  if (select === true && dataDB !== undefined) {
    await message.edit({ components: [row1, row2, row3, selectRow] })
  } else if (button === true) {
    await message.edit({ components: [row1, row2, row3, botao] })
  } else {
    await message.edit({ components: [row1, row2, row3] })
  }
}

export async function buttonsUsers (interaction: CommandInteraction<'cached'> | ButtonInteraction<CacheType>, message: Message<boolean>): Promise<void> {
  const { guildId, channelId } = interaction
  const row1Buttons = [
    new ButtonBuilder()
      .setCustomId('ticketBuy')
      .setLabel('Adicionar ao Carrinho')
      .setStyle(ButtonStyle.Success)
      .setEmoji('🛒'),
    new ButtonBuilder()
      .setCustomId('ticketConfig')
      .setStyle(ButtonStyle.Secondary)
      .setLabel('⚙️')
  ]

  const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(...row1Buttons)

  for (const value of row1Buttons) {
    const { custom_id: customID } = Object(value.toJSON())
    if (customID === 'ticketBuy') {
      const result = await db.guilds.get(`${guildId}.channels.${channelId}.messages.${message.id}.status`)
      console.log(result)
      if (result !== undefined && result === true) {
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
