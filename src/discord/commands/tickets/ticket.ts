import { EmbedBuilder, ApplicationCommandOptionType, ApplicationCommandType, type TextChannel, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js'
import { Command, Component } from '@/discord/base'
import { LogsDiscord, db } from '@/app'
import { ticketButtonsConfig } from './utils/ticketUpdateConfig'
import { createTicket } from './utils/createTicket'
import collectorButtons from './collector/collectorButtons'
import collectorModal from './collector/collectorModal'
import { deleteSelect, collectorSelect } from './collector/collectorSelect'

const buttonsModals = {
  ticketSetRole: {
    button: true,
    modal: true,
    title: '❓| ID marcado na criação do Ticket',
    label: 'Coloque um ID, ou digite "VAZIO"',
    placeholder: 'Ex: 379089880887721995',
    style: 1,
    maxLength: 30,
    type: 'role'
  },
  ticketOpen: {
    button: true,
    modal: false
  },
  ticketSelectMenu: {
    button: false,
    modal: true,
    type: 'select'
  },
  ticketAddSelect: {
    button: true,
    modal: false
  },
  'del-ticket': {
    button: true,
    modal: false
  },
  ticketSetSelect: {
    button: true,
    modal: false
  },
  ticketSetButton: {
    button: true,
    modal: false
  },
  ticketSendSave: {
    button: true,
    modal: true,
    title: '❓| ID do channel',
    label: 'Coloque um ID',
    placeholder: 'Ex: 379089880887721995',
    style: 1,
    maxLength: 30,
    type: 'embedChannelID'
  },
  ticketEmbedDelete: {
    button: true,
    modal: false
  }
}

new Command({
  name: 'ticket',
  description: '[ 🎫 Ticket ] Abrir Ticket',
  type: ApplicationCommandType.ChatInput,
  dmPermission,
  options: [
    {
      name: 'panel-embed',
      description: '[ADM] Envia a embed de configuração.',
      required: false,
      type: ApplicationCommandOptionType.Channel
    }
  ],
  async run (interaction) {
    const { guild, guildId, channelId, options } = interaction
    const channel = options.getChannel('panel-embed')
    const sendChannel = guild?.channels.cache.get(String(channel?.id)) as TextChannel

    if (channel === null) {
      await createTicket(interaction, 'Ticket aberto por meio do comando /ticket')
      return
    }

    await interaction.deferReply({ ephemeral: true })

    if (!(interaction?.memberPermissions?.has('Administrator'))) {
      await interaction.editReply({
        content: '**❌ - Você não possui permissão para utilizar este comando.**'
      })
      await LogsDiscord(
        interaction,
        guild,
        'warn',
        'noPermission',
        'Orange',
        []
      )
      return
    }
    try {
      const embed = new EmbedBuilder()
        .setTitle('Pedir suporte')
        .setDescription('Como Abrir um Ticket:\nPor favor, escolha o tipo de ticket que você deseja abrir.')
        .setFooter({ text: `Equipe ${interaction.guild?.name}`, iconURL: (interaction?.guild?.iconURL({ size: 64 }) ?? undefined) })
        .setColor('Green')
        .setThumbnail(null)
        .setImage(null)

      if (sendChannel !== undefined) {
        await sendChannel.send({ embeds: [embed] })
          .then(async (msg) => {
            await db.messages.set(`${guildId}.ticket.${channelId}.messages.${msg.id}`, {
              id: msg.id,
              embed: embed.toJSON()
            })
            await ticketButtonsConfig(interaction, msg)
            await interaction.editReply({
              embeds: [
                new EmbedBuilder()
                  .setDescription(`✅ | Mensagem enviada com sucesso ao chat: <#${sendChannel.id}>`)
                  .setColor('Green')
              ],
              components: [
                new ActionRowBuilder<ButtonBuilder>().addComponents(
                  new ButtonBuilder()
                    .setLabel('Clique para ir ao canal')
                    .setURL(
                `https://discord.com/channels/${guild?.id}/${sendChannel.id}`
                    )
                    .setStyle(ButtonStyle.Link)
                )
              ]
            })
          })
      }
    } catch (error) {
      console.error(error)
      return await interaction.editReply({
        content: 'Ocorreu um erro!'
      })
    }
  }
})

Object.entries(buttonsModals).map(([key, value]) => {
  return new Component({
    customId: key,
    type: 'Button',
    async run (buttonInteraction) {
      if (value.button || !value.modal) {
        await collectorButtons(buttonInteraction, key, value)
      }
    }
  })
})

Object.entries(buttonsModals).map(([key, value]) => {
  return new Component({
    customId: key,
    type: 'Modal',
    async run (modalInteraction) {
      if (!value.button || value.modal) {
        await collectorModal(modalInteraction, key, value)
      }
    }
  })
})

new Component({
  customId: 'ticketRowSelect',
  type: 'StringSelect',
  async run (selectInteraction) {
    await deleteSelect(selectInteraction)
  }
})

new Component({
  customId: 'ticketRowSelectProduction',
  type: 'StringSelect',
  async run (selectInteraction) {
    await collectorSelect(selectInteraction)
  }
})
