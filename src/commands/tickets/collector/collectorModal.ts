import { db } from '@/app'
import { buttonsConfig } from '@/commands/tickets/utils/ticketUpdateConfig'
import { type CacheType, type ModalSubmitInteraction } from 'discord.js'

export default async function collectorModal (interaction: ModalSubmitInteraction<CacheType>, value: any): Promise<void> {
  const { customId, guildId, channel, channelId, message, fields } = interaction
  await interaction.deferReply({ ephemeral: true })

  if (customId === 'ticketSelectMenu') {
    const fieldNames = ['title', 'description']

    const existingData = await db.guilds.get(`${guildId}.ticket.${channelId}.messages.${message?.id}.select`)
    console.log('0', existingData)
    const data: any = existingData !== undefined ? existingData : []

    console.log('1', data)

    let title = ''
    let description = ''

    for (const fieldName of fieldNames) {
      const message = fields.getTextInputValue(fieldName)

      if (fieldName === 'title') {
        title = message
      } else if (fieldName === 'description') {
        description = message
      }
    }

    data.push({ title, description })

    console.log('2', data)

    await db.guilds.set(`${guildId}.ticket.${channelId}.messages.${message?.id}.select`, data)

    await channel?.messages.fetch(String(message?.id))
      .then(async (msg) => {
        // const roleID = await db.guilds.get(`${guildId}.ticket.${channelId}.messages.${message?.id}.role`)
        const embed = await db.guilds.get(`${guildId}.ticket.${channelId}.messages.${message?.id}.embed`)
        if (typeof embed?.color === 'string') {
          if (embed?.color?.startsWith('#') === true) {
            embed.color = parseInt(embed?.color.slice(1), 16)
          }
        }
        await msg.edit({ embeds: [embed] })
          .then(async () => {
            await db.guilds.set(`${guildId}.ticket.${channelId}.messages.${message?.id}.properties.${customId}`, true)
              .then(async () => {
                await buttonsConfig(interaction, msg)
                await interaction.editReply({ content: '✅ | Salvado com sucesso!' })
              })
          })
      })
      .catch(async (err) => {
        console.log(err)
        await interaction.editReply({ content: '❌ | Ocorreu um erro!' })
      })
    return
  }

  const { type } = value
  let messageModal = fields.getTextInputValue('content')
  console.log('type:', type)
  console.log('messageModal:', messageModal)

  if (messageModal.toLowerCase() === 'vazio') {
    messageModal = ''
  }

  await db.guilds.set(`${guildId}.ticket.${channelId}.messages.${message?.id}.${type}`, messageModal)
  await channel?.messages.fetch(String(message?.id))
    .then(async (msg) => {
      // const roleID = await db.guilds.get(`${guildId}.ticket.${channelId}.messages.${message?.id}.role`)
      const embed = await db.guilds.get(`${guildId}.ticket.${channelId}.messages.${message?.id}.embed`)
      if (typeof embed?.color === 'string') {
        if (embed?.color?.startsWith('#') === true) {
          embed.color = parseInt(embed?.color.slice(1), 16)
        }
      }
      await msg.edit({ embeds: [embed] })
        .then(async () => {
          await db.guilds.set(`${guildId}.ticket.${channelId}.messages.${message?.id}.properties.${customId}`, true)
            .then(async () => {
              await buttonsConfig(interaction, msg)
              await interaction.editReply({ content: `${type} alterado para ${messageModal}` })
            })
        })
    })
    .catch(async (err) => {
      console.log(err)
      await interaction.editReply({ content: '❌ | Ocorreu um erro!' })
    })
}
