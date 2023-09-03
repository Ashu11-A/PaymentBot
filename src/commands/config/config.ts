import { ApplicationCommandOptionType, ApplicationCommandType, ChannelType, type CategoryChannel, type TextChannel } from 'discord.js'
import { Command } from '@/structs/types/Command'
import setDatabase from './utils/setDatabase'
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
          if (categoria !== null) {
            await setDatabase(interaction, canal, 'category', 'ticket', 'setado para os tickets')
          }
          if (canal !== null) {
            await setDatabase(interaction, canal, 'channel', 'ticket', 'setado para os tickets')
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
