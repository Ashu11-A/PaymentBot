import { EmbedBuilder, ApplicationCommandOptionType, ApplicationCommandType, type TextChannel, ActionRowBuilder, ButtonBuilder, ButtonStyle, Collection } from 'discord.js'
import { Command } from '@/structs/types/Command'
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

export default new Command({
  name: 'ticket',
  description: '[ 🎫 Ticket ] Abrir Ticket',
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'panel-embed',
      description: '[ADM] Envia a embed de configuração.',
      required: false,
      type: ApplicationCommandOptionType.Channel
    }
  ],
  async run ({ interaction, options }) {
    const channel = options.getChannel('panel-embed')
    const { guild, guildId, channelId } = interaction
    const sendChannel = guild?.channels.cache.get(String(channel?.id)) as TextChannel

    if (channel === null) {
      await createTicket(interaction, 'Ticket aberto por meio do comando /ticket')
      return
    }

    await interaction.deferReply({ ephemeral: true })

    if ((interaction?.memberPermissions?.has('Administrator')) === false) {
      await interaction.editReply({
        content: '**❌ - Você não possui permissão para utilizar este comando.**'
      })
      void LogsDiscord(
        interaction,
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
  },
  buttons: new Collection(
    Object.entries(buttonsModals).map(([key, value]) => [
      key,
      async (buttonInteraction) => {
        if (value.button || !value.modal) {
          await collectorButtons(buttonInteraction, key, value)
        }
      }
    ])
  ),
  modals: new Collection(
    Object.entries(buttonsModals).map(([key, value]) => [
      key,
      async (modalInteraction) => {
        if (!value.button || value.modal) {
          await collectorModal(modalInteraction, key, value)
        }
      }
    ])
  ),
  selects: new Collection([
    ['ticketRowSelect', async (selectInteraction) => {
      await deleteSelect(selectInteraction)
    }],
    ['ticketRowSelectProduction', async (selectInteraction) => {
      await collectorSelect(selectInteraction)
    }]
  ])
})
