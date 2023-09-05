import { ApplicationCommandOptionType, ApplicationCommandType, ChannelType, type CategoryChannel, type TextChannel, Collection } from 'discord.js'
import { Command } from '@/structs/types/Command'
import { setDatabase, setDatabaseString, setDatabaseSystem } from './utils/setDatabase'
import { LogsDiscord, db } from '@/app'
import { setSystem } from './utils/setSystem'

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
    await interaction.deferReply({ ephemeral: true })
    try {
      switch (options.getSubcommand(true)) {
        case 'guild': {
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
        case 'minecraft': {
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

          break
        }
        case 'ticket': {
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
        default: {
          await interaction.editReply({ content: 'Nenhum item foi selecionado, certeza que sabe o que está fazendo?' })
          break
        }
      }
    } catch (error) {
      console.error(error)
      return await interaction.editReply({
        content: 'Ocorreu um erro!'
      })
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
    ['systemLogs', async (buttonInteraction) => {
      await buttonInteraction.deferReply({ ephemeral: true })
      await setDatabaseSystem(buttonInteraction, 'status', 'systemLogs', 'Logs')
    }]
  ])
})
