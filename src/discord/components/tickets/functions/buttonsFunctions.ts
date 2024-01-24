import { db } from '@/app'
import { CustomButtonBuilder, Discord, createRow } from '@/functions'
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, ComponentType, EmbedBuilder, ModalBuilder, PermissionsBitField, type StringSelectMenuInteraction, TextInputBuilder, type ButtonInteraction, type CacheType, type Collection, type CommandInteraction, type OverwriteResolvable, type Snowflake, type TextChannel } from 'discord.js'
import { getModalData } from './getModalData'
import { buttonsUsers, ticketButtonsConfig } from './ticketUpdateConfig'

interface TicketType {
  interaction: CommandInteraction<CacheType> | ButtonInteraction<CacheType> | StringSelectMenuInteraction
}
export class TicketButtons implements TicketType {
  interaction
  constructor ({ interaction }: TicketType) {
    this.interaction = interaction
  }

  public async createTicket (options: {
    about: string
  }): Promise<void> {
    const { about } = options
    const { guild, user, guildId } = this.interaction
    const nome = `🎫-${user.id}`
    const sendChannel = guild?.channels.cache.find((c) => c.name === nome)
    const status: Record<string, boolean | undefined> | null = await db.system.get(`${guild?.id}.status`)
    const ticket = await db.guilds.get(`${guild?.id}.ticket`)

    if (sendChannel !== undefined) {
      await this.interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle(`Olá ${user.username}`)
            .setDescription('❌ | Você já possui um ticket aberto!')
            .setColor('Red')
        ],
        components: [
          await Discord.buttonRedirect({
            guildId,
            channelId: sendChannel.id,
            emoji: '🎫',
            label: 'Ir ao Ticket'
          })
        ]
      })
      return
    }

    if (status?.Ticket === false) {
      await this.interaction.editReply({ content: '❌ | Os tickets estão desativados no momento!' })
      return
    }

    try {
      const permissionOverwrites = [
        {
          id: guild?.id,
          deny: [PermissionsBitField.Flags.ViewChannel]
        },
        {
          id: user.id,
          allow: [PermissionsBitField.Flags.ViewChannel]
        }
      ] as OverwriteResolvable[] | Collection<Snowflake, OverwriteResolvable>

      /* Cria o chat do Ticket */
      const category = guild?.channels.cache.find(category => category.type === ChannelType.GuildCategory && category.id === ticket?.category)
      const ch = await guild?.channels.create({
        name: `🎫-${user.id}`,
        type: ChannelType.GuildText,
        topic: `Ticket do(a) ${user.username}, ID: ${user.id}`,
        permissionOverwrites,
        parent: category?.id
      })

      await this.interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle(`Olá ${user.username}`)
            .setDescription('✅ | Seu ticket foi criado com sucesso!')
            .setColor('Green')
        ],
        components: [
          await Discord.buttonRedirect({
            guildId,
            channelId: ch?.id,
            emoji: '🎫',
            label: 'Ir ao Ticket'
          })
        ]
      })
      const embed = new EmbedBuilder({
        fields: [
          { name: '📃・Tipo de Problema/Pedido:', value: about },
          {
            name: '😁・Solicitante:',
            value: `<@${user.id}> | ID: ${user.id}`
          },
          {
            name: '🕗・Aberto em:',
            value: '```' + new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }) + '```'
          }
        ],
        footer: { text: `Equipe ${guild?.name}`, iconURL: (guild?.iconURL({ size: 64 }) ?? undefined) }
      }).setColor('Purple')

      const botao = new ActionRowBuilder<ButtonBuilder>().addComponents(
        await CustomButtonBuilder.create({
          type: 'Ticket',
          permission: 'User',
          customId: 'delTicket',
          label: 'Fechar Ticket',
          emoji: '✖️',
          style: ButtonStyle.Danger
        })
      )
      if (ticket?.role !== undefined) {
        await ch?.send({ content: `<@&${ticket.role}>`, embeds: [embed], components: [botao] }).catch(console.error)
      } else {
        await ch?.send({ embeds: [embed], components: [botao] }).catch(console.error)
      }
    } catch (all) {
      console.error(all)
      await this.interaction.editReply({
        content: '❗️ Ocorreu um erro interno, tente mais tarde.'
      })
    }
  }

  public async setSystem (options: {
    type: 'select' | 'button'
  }): Promise<void> {
    if (!this.interaction.isButton()) return
    const { guildId, message, channelId } = this.interaction
    const { type } = options

    await db.messages.set(`${guildId}.ticket.${channelId}.messages.${message.id}.properties.SetSelect`, type === 'select')
    await db.messages.set(`${guildId}.ticket.${channelId}.messages.${message.id}.properties.SetButton`, type === 'button')
    await this.interaction.editReply({ content: '⏱️ | Aguarde só um pouco...' })
    await ticketButtonsConfig(this.interaction, message)
  }

  public async sendSave (key: string): Promise<void> {
    const { guild, guildId, channelId } = this.interaction
    const { label, maxLength, placeholder, style, title, type } = getModalData(key)

    if (this.interaction.isButton()) {
      try {
        const { message, customId } = this.interaction
        const { embedChannelID: channelEmbedID, embedMessageID: messageID } = await db.messages.get(`${guildId}.ticket.${channelId}.messages.${message?.id}`)
        const channel = guild?.channels.cache.get(channelEmbedID) as TextChannel
        const msg = await channel?.messages.fetch(messageID)

        if (typeof channelEmbedID === 'string' && messageID !== undefined) {
          await buttonsUsers(this.interaction, message.id, msg)
        } else {
          const textValue = await db.messages.get(`${guildId}.ticket.${channelId}.messages.${message.id}.${type}`)
          const modal = new ModalBuilder({ customId, title })
          const content = new ActionRowBuilder<TextInputBuilder>({
            components: [
              new TextInputBuilder({
                custom_id: 'content',
                label,
                placeholder,
                value: textValue ?? null,
                style,
                required: true,
                maxLength
              })
            ]
          })
          modal.setComponents(content)
          await this.interaction.showModal(modal)
        }
      } catch (err) {
        console.log(err)
        await this.interaction.editReply({ content: '❌ | Ocorreu um erro, tente mais tarde!' })
      }
    }
  }

  public async delete (options: {
    type: 'delTicket' | 'EmbedDelete'
  }): Promise<void> {
    if (!this.interaction.isButton()) return
    const { type } = options
    const { guild, guildId, channelId, message, user } = this.interaction
    const embed = new EmbedBuilder()
      .setColor('Gold')
    if (type === 'delTicket') {
      embed.setDescription('Tem certeza que deseja fechar o Ticket?')
    } else {
      embed.setDescription('Tem certeza que deseja deletar esse templete de Ticket?\nIsso ira deletar as informações do Banco de dados e Embeds.')
    }

    const messagePrimary = await this.interaction.editReply({
      embeds: [embed],
      components: [createRow(
        new ButtonBuilder({ customId: 'embed-confirm-button', label: 'Confirmar', style: ButtonStyle.Success }),
        new ButtonBuilder({ customId: 'embed-cancel-button', label: 'Cancelar', style: ButtonStyle.Danger })
      )]
    })
    const collector = messagePrimary.createMessageComponentCollector({ componentType: ComponentType.Button })
    collector.on('collect', async (subInteraction) => {
      collector.stop()
      const clearData = { components: [], embeds: [] }

      if (subInteraction.customId === 'embed-cancel-button') {
        await subInteraction.editReply({
          ...clearData,
          embeds: [
            new EmbedBuilder()
              .setDescription('Você cancelou a ação')
              .setColor('Green')
          ]
        })
      } else if (subInteraction.customId === 'embed-confirm-button') {
        const embed = new EmbedBuilder()
          .setColor('Red')
        if (type === 'delTicket') {
          embed
            .setTitle(`👋 | Olá ${user.username}`)
            .setDescription('❗️ | Esse ticket será excluído em 5 segundos.')
        } else {
          embed
            .setDescription('Deletando Banco de dados e Mensagens...')
        }
        await subInteraction.update({
          ...clearData,
          embeds: [embed]
        })
        if (type === 'delTicket') {
          setTimeout(() => {
            subInteraction?.channel?.delete().catch(console.error)
          }, 5000)
        } else {
          const { embedChannelID: channelEmbedID, embedMessageID: messageID } = await db.messages.get(`${guildId}.ticket.${channelId}.messages.${message?.id}`)

          if (channelEmbedID !== undefined || messageID !== undefined) {
            try {
              const channel = guild?.channels.cache.get(channelEmbedID) as TextChannel
              const msg = await channel?.messages.fetch(messageID)
              await msg.delete()
            } catch (err) {
              console.log(err)
            }
          }

          await db.messages.delete(`${guildId}.ticket.${channelId}.messages.${message?.id}`)
          await message.delete()
        }
      }
    })
  }
}
