import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ChannelType,
  type CategoryChannel,
  type TextChannel,
  Collection
} from 'discord.js'
import { Command } from '@/structs/types/Command'
import { setDatabase, setDatabaseString, setDatabaseSystem } from './utils/setDatabase'
import { LogsDiscord, db } from '@/app'
import { setSystem } from './utils/setSystem'
import { updateStatus } from '@/events/main/status'
import { modelPresence, setPresence, delModalPresence, delPresence } from './utils/Presence'

export default new Command({
  name: 'config',
  description: '[ ⚙️ configurar ] Use esse comando para configurar o bot.',
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'guild',
      description: '[ 🗂 Servidor ] Configurar elementos do servidor',
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: 'ban-kick',
          description: '[ 🚫 Bans ] Canal onde ficará os avisos de banimentos de usuários.',
          type: ApplicationCommandOptionType.Channel,
          channelTypes: [
            ChannelType.GuildText
          ]
        },
        {
          name: 'entrada',
          description: '[ 🛬 Entrada Users ] Canal onde ficará os avisos de entrada de novos usuários.',
          type: ApplicationCommandOptionType.Channel,
          channelTypes: [
            ChannelType.GuildText
          ]
        },
        {
          name: 'logs-equipe',
          description: '[ 📃 Logs ] Use para definir o canal de logs.',
          type: ApplicationCommandOptionType.Channel,
          channelTypes: [
            ChannelType.GuildText | ChannelType.GuildAnnouncement
          ]
        },
        {
          name: 'logs-geral',
          description: '[ 📃 Logs ] Use para definir o canal de logs.',
          type: ApplicationCommandOptionType.Channel,
          channelTypes: [
            ChannelType.GuildText
          ]
        },
        {
          name: 'panel',
          description: '[ 🌠 Embed ] Painel que habilita/desabilita os comandos.',
          type: ApplicationCommandOptionType.Channel,
          channelTypes: [
            ChannelType.GuildText
          ]
        },
        {
          name: 'react-message',
          description: '[ 👍 React ] Canais onde mensagens serão automaticamente adicionadas reações',
          type: ApplicationCommandOptionType.Boolean
        },
        {
          name: 'saída',
          description: '[ 🛫 Saída Users ] Canal onde ficará os avisos de saídas dos usuários.',
          type: ApplicationCommandOptionType.Channel,
          channelTypes: [
            ChannelType.GuildText
          ]
        }
      ]
    },
    {
      name: 'status',
      description: '[ ⚙️ Status ] Definir status personalizado ao bot.',
      type: ApplicationCommandOptionType.SubcommandGroup,
      options: [
        {
          name: 'opções',
          description: '[🔩] Opções Gerais',
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: 'presença',
              description: '[ 🟢 Presença ] Defina qual será o tipo de status',
              type: ApplicationCommandOptionType.String,
              choices: [
                { name: 'Online', value: 'online' },
                { name: 'Ausente', value: 'idle' },
                { name: 'Não Perturbe', value: 'dnd' },
                { name: 'Invisível', value: 'invisible' }
              ]
            },
            {
              name: 'messages',
              description: '[ 🌠 Modal ] Envia um Modal para definir as mensagens do status',
              type: ApplicationCommandOptionType.String,
              choices: [
                { name: 'Adicionar', value: 'true' },
                { name: 'Remover', value: 'false' }
              ]
            }
          ]
        },
        {
          name: 'minecraft',
          description: '[ 🧱 Minecraft ] Definir informações do servidor de Minecraft',
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: 'canal',
              description: '[ 💬 ] Canal onde ficará a embed das informações.',
              type: ApplicationCommandOptionType.Channel,
              required: false
            },
            {
              name: 'desc',
              description: '[ 📄 ] Descrição do servidor (exemplo: RankUP, Factions).',
              type: ApplicationCommandOptionType.String,
              required: false
            },
            {
              name: 'ip',
              description: '[ 🔗 ] IP do servidor.',
              type: ApplicationCommandOptionType.String,
              required: false
            },
            {
              name: 'porta',
              description: '[ 🚪 ] Porta do servidor.',
              type: ApplicationCommandOptionType.String,
              required: false
            }
          ]
        }
      ]
    },
    {
      name: 'ticket',
      description: '[ 🎫 Ticket ] Configurar tickets',
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: 'canal',
          description: '[ 🎫 Ticket ] Canal onde ficará a embed dos tickets.',
          type: ApplicationCommandOptionType.Channel,
          channelTypes: [
            ChannelType.GuildText
          ]
        },
        {
          name: 'categoria',
          description: '[ 🎫 Ticket ] Use para definir categoria dos tickets.',
          type: ApplicationCommandOptionType.Channel,
          channelTypes: [
            ChannelType.GuildCategory
          ]
        },
        {
          name: 'cargo',
          description: '[ 🎫 Ticket ] Cargo a ser marcado após um pedido ser aberto.',
          type: ApplicationCommandOptionType.Role
        }
      ]
    }
  ],
  async run ({ interaction, options }) {
    if ((interaction?.memberPermissions?.has('Administrator')) === false) {
      await interaction.reply({
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

    if (!interaction.inCachedGuild()) return
    try {
      switch (options.getSubcommand(true)) {
        case 'guild': {
          await interaction.deferReply({ ephemeral: true })
          const banKick = options.getChannel('ban-kick') as TextChannel
          const entrada = options.getChannel('entrada') as TextChannel
          const logsEquipe = options.getChannel('logs-equipe') as TextChannel
          const logsGeral = options.getChannel('logs-geral') as TextChannel
          const panel = options.getChannel('panel') as TextChannel
          const saída = options.getChannel('saída') as TextChannel

          if (banKick !== null) {
            await setDatabase(interaction, banKick, 'channel', 'banKick', 'setado para o banimento ou a expulsão de usuários')
          }
          if (entrada !== null) {
            await setDatabase(interaction, entrada, 'channel', 'entrada', 'setado para a entrada de novos usuários')
          }
          if (logsEquipe !== null) {
            await setDatabase(interaction, logsEquipe, 'channel', 'staff_logs', 'setado para as logs de entrada e saída da equipe')
          }
          if (logsGeral !== null) {
            await setDatabase(interaction, logsGeral, 'channel', 'logs', 'setado para os logs')
          }
          if (panel !== null) {
            await db.guilds.set(`${interaction.guild.id}.channel.system`, panel.id)
            await setSystem(interaction)
          }
          if (saída !== null) {
            await setDatabase(interaction, saída, 'channel', 'saída', 'setado para a saída de usuários')
          }

          break
        }
        case 'ticket': {
          await interaction.deferReply({ ephemeral: true })
          const canal = options.getChannel('canal') as TextChannel
          const cargo = options.getRole('cargo')
          const categoria = options.getChannel('categoria') as CategoryChannel

          if (canal !== null) {
            await setDatabase(interaction, canal, 'ticket', 'channel', 'setado para os tickets')
          }
          if (cargo !== null) {
            await setDatabaseString(interaction, cargo.id, 'ticket', 'role', 'foi atribuído a propriedade')
          }
          if (categoria !== null) {
            await setDatabase(interaction, categoria, 'ticket', 'category', 'setado para os tickets')
          }

          break
        }
      }

      switch (options.getSubcommandGroup(false)) {
        case 'status': {
          switch (options.getSubcommand(true)) {
            case 'opções': {
              const presença = options.getString('presença')
              const messages = options.getString('messages')

              if (presença !== null) {
                await setDatabaseString(interaction, presença, 'status', 'type', 'foi atribuído a propriedade')
              }

              if (messages !== null) {
                if (messages === 'true') {
                  await modelPresence(interaction)
                } else {
                  await delPresence(interaction)
                }
              }
              break
            }
            case 'minecraft': {
              await interaction.deferReply({ ephemeral: true })
              const canal = options.getChannel('canal') as TextChannel
              const desc = options.getString('desc') as string
              const ip = options.getString('ip') as string
              const porta = options.getString('porta') as string

              if (canal !== null) {
                await setDatabase(interaction, canal, 'channel', 'minecraft', 'setado para o status do servidor de minecraft')
              }
              if (desc !== null) {
                await setDatabaseString(interaction, desc, 'minecraft', 'desc', 'foi atribuído a propriedade')
              }
              if (ip !== null) {
                await setDatabaseString(interaction, ip, 'minecraft', 'ip', 'foi atribuído a propriedade')
              }
              if (porta !== null) {
                await setDatabaseString(interaction, porta, 'minecraft', 'porta', 'foi atribuído a propriedade')
              }
            }
          }
        }
      }
    } catch (error) {
      console.error(error)
      try {
        return await interaction.editReply({
          content: 'Ocorreu um erro!'
        })
      } catch {
        return await interaction.reply({
          content: 'Ocorreu um erro!'
        })
      }
    }
  },
  buttons: new Collection([
    ['systemTicket', async (buttonInteraction) => {
      await buttonInteraction.deferReply({ ephemeral: true })
      await setDatabaseSystem(buttonInteraction, 'status', 'systemTicket', 'Ticket')
    }],
    ['systemWelcomer', async (buttonInteraction) => {
      await buttonInteraction.deferReply({ ephemeral: true })
      await setDatabaseSystem(buttonInteraction, 'status', 'systemWelcomer', 'Boas vindas')
    }],
    ['systemStatus', async (buttonInteraction) => {
      await buttonInteraction.deferReply({ ephemeral: true })
      await setDatabaseSystem(buttonInteraction, 'status', 'systemStatus', 'Status')
    }],
    ['systemStatusMinecraft', async (buttonInteraction) => {
      await buttonInteraction.deferReply({ ephemeral: true })
      await setDatabaseSystem(buttonInteraction, 'status', 'systemStatusMinecraft', 'Status')
    }],
    ['systemStatusString', async (buttonInteraction) => {
      await buttonInteraction.deferReply({ ephemeral: true })
      await setDatabaseSystem(buttonInteraction, 'status', 'systemStatusString', 'Status')
    }],
    ['systemLogs', async (buttonInteraction) => {
      await buttonInteraction.deferReply({ ephemeral: true })
      await setDatabaseSystem(buttonInteraction, 'status', 'systemLogs', 'Logs')
    }]
  ]),
  modals: new Collection([
    ['MessagePresence', async (modalInteraction) => {
      await setPresence(modalInteraction)
    }]
  ]),
  selects: new Collection([
    ['messagesStatusArray', async (selectInteraction) => {
      await delModalPresence(selectInteraction)
    }]
  ])
})
