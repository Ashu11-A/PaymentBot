import { db } from '@/app'
import { type TextChannel, type CacheType, type ModalSubmitInteraction } from 'discord.js'
import { getModalData } from './getModalData'
import { buttonsUsers, ticketButtonsConfig } from './ticketUpdateConfig'

interface TicketType {
  interaction: ModalSubmitInteraction<CacheType>
}
export class TicketModals implements TicketType {
  interaction
  constructor ({ interaction }: TicketType) {
    this.interaction = interaction
  }

  public async sendSave (key: string): Promise<void> {
    const { guild, guildId, channelId } = this.interaction
    const interaction = this.interaction
    const { message, fields } = interaction
    const { db: dataDB } = getModalData(key)
    const messageModal = fields.getTextInputValue('content')
    let data = await db.messages.get(`${guildId}.ticket.${channelId}.messages.${message?.id}`)
    const channelVerify = guild?.channels.cache.get(data?.channelEmbedID) as TextChannel

    try {
      if (data?.channelEmbedID === undefined) {
        await channelVerify?.messages.fetch(data?.messageID).catch(async (err) => { console.log(err) })
        await db.messages.set(`${guildId}.ticket.${channelId}.messages.${message?.id}.${dataDB}`, messageModal)

        const channel = guild?.channels.cache.get(messageModal) as TextChannel
        data = await db.messages.get(`${guildId}.ticket.${channelId}.messages.${message?.id}`)

        const msg = await channel.send({ embeds: [data?.embed] })
        await db.messages.set(`${guildId}.ticket.${channelId}.messages.${message?.id}.embedMessageID`, msg.id)
        await buttonsUsers(interaction, message?.id, msg)
      }
    } catch (err) {
      console.log(err)
      await this.interaction.reply({ content: '❌ | Ocorreu um erro, tente mais tarde!' })
    }
  }

  public async AddSelect (key: string): Promise<void> {
    const { guildId, channelId, message, channel, fields } = this.interaction
    const fieldNames = ['title', 'description', 'emoji']
    const { select: existingData } = await db.messages.get(`${guildId}.ticket.${channelId}.messages.${message?.id}`)
    const data = existingData !== undefined ? existingData : []

    let title = ''
    let description = ''
    let emoji = ''

    for (const fieldName of fieldNames) {
      const message = fields.getTextInputValue(fieldName)

      if (fieldName === 'title') {
        title = message
      } else if (fieldName === 'description') {
        description = message
      } else if (fieldName === 'emoji') {
        emoji = message
      }
    }

    data.push({ title, description, emoji })

    await db.messages.set(`${guildId}.ticket.${channelId}.messages.${message?.id}.select`, data)
    await channel?.messages.fetch(String(message?.id))
      .then(async (msg) => {
        const { embed } = await db.messages.get(`${guildId}.ticket.${channelId}.messages.${message?.id}`)
        if (typeof embed?.color === 'string') {
          if (embed?.color?.startsWith('#') === true) {
            embed.color = parseInt(embed?.color.slice(1), 16)
          }
        }
        await msg.edit({ embeds: [embed] })
          .then(async () => {
            await db.messages.set(`${guildId}.ticket.${channelId}.messages.${message?.id}.properties.${key}`, true)
              .then(async () => {
                await ticketButtonsConfig(this.interaction, msg)
              })
          })
      })
      .catch(async (err) => {
        console.log(err)
        await this.interaction.editReply({ content: '❌ | Ocorreu um erro!' })
      })
  }

  public async setConfig (key: string): Promise<void> {
    const { fields, guildId, channelId, message, channel } = this.interaction
    const { db: dataDB } = getModalData(key)
    console.log(fields)
    let messageModal = fields.getTextInputValue('content')
    console.log('messageModal:', messageModal)

    if (messageModal.toLowerCase() === 'vazio') messageModal = ''

    await db.messages.set(`${guildId}.ticket.${channelId}.messages.${message?.id}.${dataDB}`, messageModal)
    await channel?.messages.fetch(String(message?.id))
      .then(async (msg) => {
        const { embed } = await db.messages.get(`${guildId}.ticket.${channelId}.messages.${message?.id}`)
        if (typeof embed?.color === 'string') {
          if (embed?.color?.startsWith('#') === true) {
            embed.color = parseInt(embed?.color.slice(1), 16)
          }
        }
        await msg.edit({ embeds: [embed] })
          .then(async () => {
            await db.messages.set(`${guildId}.ticket.${channelId}.messages.${message?.id}.properties.${key}`, true)
              .then(async () => {
                await ticketButtonsConfig(this.interaction, msg)
                await this.interaction.editReply({ content: '✅ | Elemento ' + '`' + dataDB + '`' + ' foi alterado com sucesso!' })
              })
          })
      })
      .catch(async (err) => {
        console.log(err)
        await this.interaction.editReply({ content: '❌ | Ocorreu um erro!' })
      })
  }
}
