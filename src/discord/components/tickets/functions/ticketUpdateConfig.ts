import { db } from '@/app'
import { createRowEdit } from '@/discord/events/SUEE/functions/createRowEdit'
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, type Message, type CommandInteraction, type CacheType, type ModalSubmitInteraction, type ButtonInteraction, StringSelectMenuBuilder, type StringSelectMenuInteraction } from 'discord.js'

export async function ticketButtonsConfig (interaction: StringSelectMenuInteraction<CacheType> | CommandInteraction<'cached'> | ModalSubmitInteraction<CacheType> | ButtonInteraction<CacheType> | CommandInteraction<CacheType>, message: Message<boolean>): Promise<void> {
  const { guildId, channelId } = interaction
  const options: Array<{ label: string, description: string, value: string, emoji: string }> = []
  const data = await db.messages.get(`${guildId}.ticket.${channelId}.messages.${message.id}`)
  console.log(data)

  const embedEdit = await createRowEdit(interaction, message, 'ticket')

  const setSystem = [
    new ButtonBuilder({
      customId: 'ticketSetRole',
      label: 'Add Cargo',
      emoji: '🛂'
    }),
    new ButtonBuilder({
      customId: 'ticketSetSelect',
      label: 'SelectMenu',
      emoji: '🗄️'
    }),
    new ButtonBuilder({
      customId: 'ticketAddSelect',
      label: 'Add Select',
      emoji: '📝',
      disabled: true
    }),
    new ButtonBuilder({
      customId: 'ticketSetButton',
      label: 'Botão',
      emoji: '🔘'
    })
  ]

  const saveDelete = [
    new ButtonBuilder({
      customId: 'ticketSendSave',
      label: 'Enviar',
      emoji: '✔️',
      style: ButtonStyle.Success
    }),
    new ButtonBuilder({
      customId: 'ticketEmbedDelete',
      label: 'Apagar',
      emoji: '✖️',
      style: ButtonStyle.Danger
    })
  ]

  let number = 0
  if (data?.select !== undefined) {
    data.select.forEach(({ title, description, emoji }: { title: string, description: string, emoji: string }) => {
      options.push({
        label: title,
        description,
        value: String(number),
        emoji
      })
      number += 1
    })
  }

  let row4
  const enabled = data?.properties?.ticketSetSelect

  if (enabled !== undefined && enabled === true) {
    row4 = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      new StringSelectMenuBuilder({
        custom_id: 'ticketRowSelect',
        placeholder: 'Escolha qual tipo de ticket deseja abrir!',
        options
      })
    )
  } else {
    row4 = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId('ticketOpen')
        .setEmoji({ name: '📩' })
        .setLabel('Abra seu ticket')
        .setStyle(ButtonStyle.Success)
    )
  }

  const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(...setSystem)
  const row3 = new ActionRowBuilder<ButtonBuilder>().addComponents(...saveDelete)

  for (const value of setSystem) {
    const { custom_id: customID } = Object(value.toJSON())

    if (customID === 'ticketAddSelect' || customID === 'ticketRemSelect') {
      console.log('Botão:', customID, 'Enabled:', enabled)
      if (enabled !== undefined && enabled === true) {
        value.setDisabled(false)
      } else {
        value.setDisabled(true)
      }
    }

    if (data?.properties !== undefined && data?.properties[customID] === true) {
      value.setStyle(ButtonStyle.Primary)
    } else {
      value.setStyle(ButtonStyle.Secondary)
    }
  }

  for (const value of saveDelete) {
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

  for (const value of row4.components) {
    if (value instanceof StringSelectMenuBuilder) {
      const result = data?.properties?.config

      if (result === undefined || result === true) {
        value.setPlaceholder('Modo edição, selecione um valor para remover.')
      } else {
        value.setPlaceholder('Escolha qual tipo de ticket deseja abrir!')
      }
    }
  }

  try {
    await message.edit({ components: [embedEdit, row2, row3, row4] })

    await interaction.editReply({ content: '✅ | Salvado com sucesso!' })
  } catch (err) {
    console.log(err)
    await message.edit({ components: [embedEdit, row2, row3] })
    await interaction.editReply({ content: '❌ | SelectMenu ficou sem nenhum item...!' })
  }
}

export async function buttonsUsers (interaction: CommandInteraction<'cached'> | ButtonInteraction<CacheType> | ModalSubmitInteraction<CacheType>, originID: string | undefined, messageSend: Message<boolean>): Promise<void> {
  const { guildId, channelId } = interaction

  const options: Array<{ label: string, description: string, value: string, emoji: string }> = []
  const data = await db.messages.get(`${guildId}.ticket.${channelId}.messages.${originID}`)

  let number = 0
  if (data?.select !== undefined) {
    data?.select.forEach(({ title, description, emoji }: { title: string, description: string, emoji: string }) => {
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
    new ButtonBuilder({
      customId: 'ticketOpen',
      label: 'Abra seu ticket',
      emoji: '📩',
      style: ButtonStyle.Success
    })
  )

  const selectRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(...row1Buttons)

  await messageSend.edit({ components: [] })
  try {
    if (data?.properties?.ticketSetSelect === true && data?.select !== undefined) {
      await messageSend.edit({ embeds: [data?.embed], components: [selectRow] })
        .then(async () => {
          await interaction.reply({ content: '✅ | Mensagem atualizada com sucesso', ephemeral: true })
            .catch(async () => await interaction.followUp({ content: '✅ | Mensagem atualizada com sucesso', ephemeral: true }))
        })
    } else {
      await messageSend.edit({ embeds: [data?.embed], components: [botao] })
        .then(async () => {
          await interaction.reply({ content: '✅ | Mensagem atualizada com sucesso', ephemeral: true })
            .catch(async () => await interaction.followUp({ content: '✅ | Mensagem atualizada com sucesso', ephemeral: true }))
        })
    }
  } catch (err) {
    console.log(err)
  }
}
