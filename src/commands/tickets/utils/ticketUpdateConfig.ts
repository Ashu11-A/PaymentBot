import { db } from '@/app'
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, type Message, type CommandInteraction, type CacheType, type ModalSubmitInteraction, type ButtonInteraction, StringSelectMenuBuilder, type StringSelectMenuInteraction } from 'discord.js'

export async function buttonsConfig (interaction: StringSelectMenuInteraction<CacheType> | CommandInteraction<'cached'> | ModalSubmitInteraction<CacheType> | ButtonInteraction<CacheType> | CommandInteraction<CacheType>, message: Message<boolean>): Promise<void> {
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
      .setCustomId('ticketSetButton')
      .setLabel('Botão')
      .setEmoji('🔘')
  ]

  const row3Buttons = [
    new ButtonBuilder()
      .setCustomId('ticketSendSave')
      .setLabel('Enviar')
      .setStyle(ButtonStyle.Success)
      .setEmoji('✔️'),
    new ButtonBuilder()
      .setCustomId('ticketEmbedDelete')
      .setLabel('Apagar')
      .setStyle(ButtonStyle.Danger)
      .setEmoji('✖️')
  ]
  const { select: dataDB } = await db.messages.get(`${guildId}.ticket.${channelId}.messages.${message?.id}`)
  const options: Array<{ label: string, description: string, value: string, emoji: string }> = []

  console.log('Select: ' + dataDB, 'MessageID: ' + message.id)

  let number = 0
  if (dataDB !== undefined) {
    dataDB.forEach(({ title, description, emoji }: { title: string, description: string, emoji: string }) => {
      console.log(`Title: ${title}`)
      console.log(`Description: ${description}`)
      console.log(`Emoji: ${emoji}`)
      options.push({
        label: title,
        description,
        value: String(number),
        emoji
      })
      number += 1
    })
  }

  const row4Buttons = [
    new StringSelectMenuBuilder({
      custom_id: 'ticketRowSelect',
      placeholder: 'Escolha qual tipo de ticket deseja abrir!',
      options
    })
  ]

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
  const row4 = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(...row4Buttons)

  const { properties } = await db.messages.get(`${guildId}.ticket.${channelId}.messages.${message.id}`)

  for (const value of row1Buttons) {
    const { custom_id: customID } = Object(value.toJSON())
    if (properties[customID] !== undefined) {
      value.setStyle(ButtonStyle.Primary)
    } else {
      value.setStyle(ButtonStyle.Secondary)
    }
  }

  for (const value of row2Buttons) {
    const { custom_id: customID } = Object(value.toJSON())

    if (customID === 'ticketAddSelect' || customID === 'ticketRemSelect') {
      const enabled = properties.ticketSetSelect
      if (enabled !== undefined && enabled === true) {
        value.setDisabled(false)
      } else {
        value.setDisabled(true)
      }
    }

    if (properties[customID] !== undefined) {
      value.setStyle(ButtonStyle.Primary)
    } else {
      value.setStyle(ButtonStyle.Secondary)
    }
  }

  for (const value of row3Buttons) {
    const { custom_id: customID } = Object(value.toJSON())

    if (customID === 'ticketSendSave') {
      const { embedChannelID: embedSend } = await db.messages.get(`${guildId}.ticket.${channelId}.messages.${message.id}`)
      if (embedSend !== undefined && typeof embedSend === 'string') {
        value.setEmoji('📝')
        value.setLabel('Editar')
      } else {
        value.setEmoji('📤')
        value.setLabel('Enviar')
      }
    }
  }

  for (const value of row4Buttons) {
    const result = properties.config

    if (result === undefined || result === true) {
      value.setPlaceholder('Modo edição, selecione um valor para remover.')
    } else {
      value.setPlaceholder('Escolha qual tipo de ticket deseja abrir!')
    }
  }

  const clearData = { components: [] }
  await message.edit({ ...clearData })

  const { ticketSetSelect: select, ticketSetButton: button } = properties

  console.log('select', select, 'button', button)
  try {
    if (select === true && dataDB !== undefined) {
      await message.edit({ components: [row1, row2, row3, row4] })
    } else if (button === true) {
      await message.edit({ components: [row1, row2, row3, botao] })
    } else {
      await message.edit({ components: [row1, row2, row3] })
    }
    await interaction.editReply({ content: '✅ | Salvado com sucesso!' })
  } catch (err) {
    console.log(err)
    await message.edit({ components: [row1, row2, row3] })
    await interaction.editReply({ content: '❌ | SelectMenu ficou sem nenhum item...!' })
  }
}

export async function buttonsUsers (interaction: CommandInteraction<'cached'> | ButtonInteraction<CacheType> | ModalSubmitInteraction<CacheType>, originID: string | undefined, messageSend: Message<boolean>): Promise<void> {
  const { guildId, channelId } = interaction

  const { select: dataDB } = await db.messages.get(`${guildId}.ticket.${channelId}.messages.${originID}`)
  const options: Array<{ label: string, description: string, value: string, emoji: string }> = []

  console.log('Select: ' + dataDB, 'MessageID: ' + messageSend.id)
  let number = 0
  if (dataDB !== undefined) {
    dataDB.forEach(({ title, description, emoji }: { title: string, description: string, emoji: string }) => {
      console.log(`Title: ${title}`)
      console.log(`Description: ${description}`)
      console.log(`Emoji: ${emoji}`)
      options.push({
        label: title,
        description,
        value: `${number}_${channelId}_${originID}`,
        emoji
      })
      number += 1
    })
  }

  const row1Buttons = [
    new StringSelectMenuBuilder({
      custom_id: 'ticketRowSelectProduction',
      placeholder: 'Escolha qual tipo de ticket deseja abrir!',
      options
    })
  ]

  const botao = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId('ticketOpen')
      .setEmoji({ name: '📩' })
      .setLabel('Abra seu ticket')
      .setStyle(ButtonStyle.Success)
  )

  const selectRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(...row1Buttons)

  const clearData = { components: [] }
  await messageSend.edit({ ...clearData })
  const { embed, properties } = await db.messages.get(`${guildId}.ticket.${channelId}.messages.${originID}`)
  const select = properties.ticketSetSelect

  try {
    if (select === true && dataDB !== undefined) {
      await messageSend.edit({ embeds: [embed], components: [selectRow] })
        .then(async () => {
          await interaction.reply({ content: '✅ | Mensagem atualizada com sucesso', ephemeral: true })
            .catch(async () => await interaction.followUp({ content: '✅ | Mensagem atualizada com sucesso', ephemeral: true }))
        })
    } else {
      await messageSend.edit({ embeds: [embed], components: [botao] })
        .then(async () => {
          await interaction.reply({ content: '✅ | Mensagem atualizada com sucesso', ephemeral: true })
            .catch(async () => await interaction.followUp({ content: '✅ | Mensagem atualizada com sucesso', ephemeral: true }))
        })
    }
  } catch (err) {
    console.log(err)
  }
}
