import { ApplicationCommandOptionType, ApplicationCommandType, ChannelType, type CategoryChannel, type TextChannel } from 'discord.js'
import { Command } from '@/structs/types/Command'
import { setDatabase, setDatabaseString } from './utils/setDatabase'
import { LogsDiscord } from '@/app'

export default new Command({
  name: 'config',
  description: '[ ⚙️ configurar ] Use esse comando para configurar o bot.',
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'ticket',
      description: '[ 🎫 Ticket ] Configurar tickets',
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: 'categoria',
          description: '[ 🎫 Ticket ] Use para definir categoria dos tickets.',
          type: ApplicationCommandOptionType.Channel,
          channelTypes: [
            ChannelType.GuildCategory
          ]
        },
        {
          name: 'canal',
          description: '[ 🎫 Ticket ] Canal onde ficará a embed dos tickets.',
          type: ApplicationCommandOptionType.Channel,
          channelTypes: [
            ChannelType.GuildText
          ]
        },
        {
          name: 'cargo',
          description: '[ 🎫 Ticket ] Cargo a ser marcado após um pedido ser aberto.',
          type: ApplicationCommandOptionType.Role
        }
      ]
    },
    {
      name: 'guild',
      description: '[ 🗂 Servidor ] Configurar elementos do servidor',
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: 'logs',
          description: '[ 📃 Logs ] Use para definir o canal do logs.',
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
          name: 'saída',
          description: '[ 🛫 Saída Users ] Canal onde ficará os avisos de saidas dos usuários.',
          type: ApplicationCommandOptionType.Channel,
          channelTypes: [
            ChannelType.GuildText
          ]
        },
        {
          name: 'ban-kick',
          description: '[ 🚫 Bans ] Canal onde ficará os avisos de banimentos de usuários.',
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
        },
        {
          name: 'desc',
          description: '[ 📄 ] Descrição do servidor (exemplo: RankUP, Factions).',
          type: ApplicationCommandOptionType.String,
          required: false
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
        case 'ticket': {
          const categoria = options.getChannel('categoria') as CategoryChannel
          const canal = options.getChannel('canal') as TextChannel
          const cargo = options.getRole('cargo')
          if (categoria !== null) {
            await setDatabase(interaction, canal, 'category', 'ticket', 'setado para os tickets')
          }
          if (canal !== null) {
            await setDatabase(interaction, canal, 'channel', 'ticket', 'setado para os tickets')
          }
          if (cargo !== null) {
            await setDatabaseString(interaction, cargo.id, 'ticket', 'role', 'foi atribuido a propriedade')
          }
          break
        }
        case 'guild': {
          const logs = options.getChannel('logs') as TextChannel
          const entrada = options.getChannel('entrada') as TextChannel
          const saída = options.getChannel('saída') as TextChannel
          const banKick = options.getChannel('ban-kick') as TextChannel
          if (logs !== null) {
            await setDatabase(interaction, logs, 'channel', 'logs', 'setado para os logs')
          }
          if (entrada !== null) {
            await setDatabase(interaction, entrada, 'channel', 'entrada', 'setado para a entrada de novos usuários')
          }
          if (saída !== null) {
            await setDatabase(interaction, saída, 'channel', 'saída', 'setado para a saída de usuários')
          }
          if (banKick !== null) {
            await setDatabase(interaction, banKick, 'channel', 'banKick', 'setado para o banimento ou a expulção de usuários')
          }
          break
        }
        case 'minecraft': {
          const canal = options.getChannel('canal') as TextChannel
          const ip = options.getString('ip') as string
          const porta = options.getString('porta') as string
          const desc = options.getString('desc') as string
          if (canal !== null) {
            await setDatabase(interaction, canal, 'channel', 'minecraft', 'setado para o status do servidor de minecraft')
          }
          if (ip !== null) {
            await setDatabaseString(interaction, ip, 'minecraft', 'ip', 'foi atribuido a propriedade')
          }
          if (porta !== null) {
            await setDatabaseString(interaction, porta, 'minecraft', 'porta', 'foi atribuido a propriedade')
          }
          if (desc !== null) {
            await setDatabaseString(interaction, desc, 'minecraft', 'desc', 'foi atribuido a propriedade')
          }
          break
        }
        default: {
          await interaction.reply({ content: 'Nenhum item foi selecionado, certeza que sabe o que está fazendo?' })
          return
        }
      }
      await interaction.reply({ content: '✅ - Configurações salvas...', ephemeral: true })
    } catch (error) {
      console.error(error)
      return await interaction.reply({
        content: 'Ocorreu um erro!'
      })
    }
  }
})
