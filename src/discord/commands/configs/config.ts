import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ChannelType,
  type CategoryChannel,
  type TextChannel
} from 'discord.js'
import { Command, Component } from '@/discord/base'
import { Database } from '@/functions'
import { db } from '@/app'
import { setSystem } from '@/discord/commands/configs/utils/setSystem'
import { modelPresence, setPresence, delModalPresence, delPresence } from './utils/Presence'
import { sendEmbed } from '@/discord/components/payments'
import { Discord } from '@/functions/Discord'

const system = {
  systemTicket: { info: 'Tickets' },
  systemPayments: { info: 'Pagamentos' },
  systemWelcomer: { info: 'Boas vindas' },
  systemStatus: { info: 'Status' },
  systemStatusMinecraft: { info: 'Status', remove: 'systemStatusString' },
  systemStatusString: { info: 'Status', remove: 'systemStatusMinecraft' },
  systemLogs: { info: 'Logs' },
  systemStatusOnline: { type: 'systemStatusType', info: 'online' },
  systemStatusAusente: { type: 'systemStatusType', info: 'idle' },
  systemStatusNoPerturbe: { type: 'systemStatusType', info: 'dnd' },
  systemStatusInvisível: { type: 'systemStatusType', info: 'invisible' }
}

new Command({
  name: 'config',
  description: '[ ⚙️ configurar ] Use esse comando para configurar o bot.',
  dmPermission,
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
          type: ApplicationCommandOptionType.Channel
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
      name: 'pagamentos',
      description: '[ 🛒 Pagamentos ] Configure o sistema de pagamento.',
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: 'add-produto',
          description: '[ 📦 ] Cria um novo produto configurável no canal desejado.',
          type: ApplicationCommandOptionType.Channel,
          channelTypes: [
            ChannelType.GuildText
          ]
        },
        {
          name: 'carrinho',
          description: '[ 🗂 ] Escolha a categoria onde os carrinhos serão abertos',
          type: ApplicationCommandOptionType.Channel,
          channelTypes: [
            ChannelType.GuildCategory
          ]
        },
        {
          name: 'autenticação',
          description: '[ 🔐 ] Autenticar no sistema de pagamento desejado.',
          type: ApplicationCommandOptionType.String,
          choices: [
            { name: 'Mercado Pago', value: 'mp' }
          ]
        }
      ]
    },
    {
      name: 'urls',
      description: '[ 🔗 ] Configure as URLs que o bot irá utilizar.',
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: 'site',
          description: 'Homepage do projeto/host.',
          type: ApplicationCommandOptionType.String
        },
        {
          name: 'loja',
          description: 'Se houver uma loja.',
          type: ApplicationCommandOptionType.String
        },
        {
          name: 'pterodactyl',
          description: 'Painel Pterodactyl',
          type: ApplicationCommandOptionType.String
        },
        {
          name: 'ctrlpanel',
          description: 'Painel ControlPanel',
          type: ApplicationCommandOptionType.String
        }
      ]
    }
  ],
  async run (interaction) {
    const havePermision = await Discord.Permission(interaction, 'Administrator', 'noPermissionBanKick')
    if (havePermision) return

    if (!interaction.inCachedGuild()) return
    const { options } = interaction
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
            await Database.set({
              interaction,
              data: banKick,
              pathDB: 'channel.banKick',
              text: 'setado para o banimento ou a expulsão de usuários'
            })
          }
          if (entrada !== null) {
            await Database.set({
              interaction,
              data: entrada,
              pathDB: 'channel.entrada',
              text: 'setado para a entrada de novos usuários'
            })
          }
          if (logsEquipe !== null) {
            await Database.set({
              interaction,
              data: logsEquipe,
              pathDB: 'channel.staff_logs',
              text: 'setado para as logs de entrada e saída da equipe'
            })
          }
          if (logsGeral !== null) {
            await Database.set({
              interaction,
              data: logsGeral,
              pathDB: 'channel.logs',
              text: 'setado para os logs'
            })
          }
          if (panel !== null) {
            await db.guilds.set(`${interaction.guild.id}.channel.system`, panel.id)
            await setSystem(interaction)
          }
          if (saída !== null) {
            await Database.set({
              interaction,
              data: saída,
              pathDB: 'channel.saída',
              text: 'setado para a saída de usuários'
            })
          }

          break
        }
        case 'pagamentos': {
          await interaction.deferReply({ ephemeral: true })
          const addProduto = options.getChannel('add-produto') as TextChannel
          const carrinho = options.getChannel('carrinho') as CategoryChannel
          const autenticação = options.getString('autenticação')

          if (addProduto !== null) {
            await sendEmbed(interaction, addProduto)
          }
          if (carrinho !== null) {
            await Database.set({
              interaction,
              data: carrinho,
              pathDB: 'payments.category'
            })
          }
          if (autenticação !== null) {
            await Database.set({
              interaction,
              data: autenticação,
              pathDB: 'payments.category',
              text: 'setado para os autenticação'
            })
          }

          break
        }
        case 'urls': {
          await interaction.deferReply({ ephemeral: true })
          const site = options.getString('site')
          const loja = options.getString('loja')
          const ptero = options.getString('pterodactyl')
          const ctrlPanel = options.getString('ctrlPanel')

          if (site !== null) {
            await Database.set({
              interaction,
              data: site,
              pathDB: 'urls.site'
            })
          }
          if (loja !== null) {
            await Database.set({
              interaction,
              data: loja,
              pathDB: 'urls.loja'
            })
          }
          if (ptero !== null) {
            await Database.set({
              interaction,
              data: ptero,
              pathDB: 'urls.ptero'
            })
          }
          if (ctrlPanel !== null) {
            await Database.set({
              interaction,
              data: ctrlPanel,
              pathDB: 'urls.ctrl'
            })
          }
          break
        }
      }

      switch (options.getSubcommandGroup(false)) {
        case 'status': {
          switch (options.getSubcommand(true)) {
            case 'opções': {
              const messages = options.getString('messages')

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
                await Database.set({
                  interaction,
                  data: canal,
                  typeDB: 'guilds',
                  pathDB: 'channel.minecraft',
                  text: 'setado para o status do servidor de minecraft'
                })
              }
              if (desc !== null) {
                await Database.set({
                  interaction,
                  data: desc,
                  pathDB: 'minecraft.desc'
                })
              }
              if (ip !== null) {
                await Database.set({
                  interaction,
                  data: ip,
                  pathDB: 'minecraft.ip'
                })
              }
              if (porta !== null) {
                await Database.set({
                  interaction,
                  data: porta,
                  pathDB: 'minecraft.porta'
                })
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
        return await interaction.channel?.send({
          content: 'Ocorreu um erro!'
        })
      }
    }
  }
})

Object.entries(system).map(async ([key, value]) => {
  await Discord.registerComponent({
    customId: key,
    type: 'Button',
    async run (buttonInteraction) {
      await buttonInteraction.deferReply({ ephemeral })
      if ('type' in value) {
        await Database.setDelete({
          interaction: buttonInteraction,
          systemName: value.type,
          pathDB: 'status',
          displayName: key,
          typeDB: 'system',
          enabledType: value.info
        })
      } else if ('remove' in value) {
        await Database.setDelete({
          interaction: buttonInteraction,
          systemName: key,
          pathDB: 'status',
          displayName: value.info,
          typeDB: 'system',
          enabledType: 'switch',
          otherSystemNames: [value.remove]
        })
      } else {
        await Database.setDelete({
          interaction: buttonInteraction,
          systemName: key,
          pathDB: 'status',
          displayName: value.info,
          typeDB: 'system',
          enabledType: 'switch'
        })
      }
    }
  })
})

new Component({
  customId: 'MessagePresence',
  type: 'Modal',
  async run (modalInteraction) {
    await setPresence(modalInteraction)
  }
})

new Component({
  customId: 'messagesStatusArray',
  type: 'StringSelect',
  async run (selectInteraction) {
    await delModalPresence(selectInteraction)
  }
})
