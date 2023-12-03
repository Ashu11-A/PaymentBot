import { db } from '@/app'
import { Command } from '@/discord/base'
import { CustomButtonBuilder, Discord } from '@/functions'
import { ApplicationCommandOptionType, ApplicationCommandType, EmbedBuilder, type TextChannel, codeBlock, ChannelType, type ChatInputCommandInteraction, type ButtonBuilder, ButtonStyle, ActionRowBuilder, type CacheType } from 'discord.js'

new Command({
  name: 'cupons',
  description: '[ 🎟️ ] Gerenciar Cupons',
  dmPermission,
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'create',
      description: 'Criar novo cupom',
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: 'code',
          description: 'Código do cupom',
          type: ApplicationCommandOptionType.String,
          required: true
        },
        {
          name: 'desconto',
          description: 'Desconto em Porcentagem',
          type: ApplicationCommandOptionType.Integer,
          required: true
        },
        {
          name: 'usos',
          description: 'Total de vezes que se pode usar o cupom',
          type: ApplicationCommandOptionType.Integer,
          required: false
        }
      ]
    },
    {
      name: 'delete',
      description: 'Deleta um cupom existente',
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: 'code',
          description: 'Código do cupom',
          type: ApplicationCommandOptionType.String,
          required: true
        }
      ]
    },
    {
      name: 'panel',
      description: 'Painel de controle dos cupons',
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: 'channel',
          description: 'Embed de gerenciamento',
          type: ApplicationCommandOptionType.Channel,
          channelTypes: [
            ChannelType.GuildText
          ]
        }
      ]
    }
  ],
  async run (interaction) {
    if (await Discord.Permission(interaction, 'Administrator')) return
    const { options, guildId, user, guild } = interaction
    const logsDB = await db.guilds.get(`${guildId}.channel.logs`) as string
    const logsChannel = guild?.channels.cache.get(logsDB) as TextChannel | undefined
    const panel = options.getChannel('channel') as TextChannel

    try {
      if (panel !== null) {
        console.log(panel)
        await panelCupons({ interaction, channel: panel })
        return
      }
      switch (options.getSubcommand(true)) {
        case 'create': {
          await interaction.deferReply({ ephemeral })

          const code = options.getString('code', true)
          const desconto = options.getInteger('desconto', true)
          const usos = options.getInteger('usos')

          const embed = new EmbedBuilder({
            title: '✅ | Cupom criado com sucesso',
            fields: [
              {
                name: '📌 | Ação:',
                value: `<@${user.id}> criou um cupom.`
              },
              {
                name: '🎟️ | Código:',
                value: codeBlock(code)
              },
              {
                name: '✳️ | Desconto:',
                value: codeBlock(desconto + '%')
              },
              {
                name: '🔢 | Uso Max: ',
                value: codeBlock(String(usos ?? 'ilimitado'))
              },
              {
                name: '📆 | Data:',
                value: codeBlock(new Date(Date.now()).toLocaleString('pt-BR'))
              }
            ]
          }).setColor('Green')

          await db.payments.set(`${guildId}.cupons.${code.toLowerCase()}`, {
            desconto,
            usosMax: usos
          }).then(async () => {
            await interaction.editReply({ embeds: [embed] })

            if (logsChannel !== undefined) {
              await logsChannel.send({ embeds: [embed] })
            }
          })
          break
        }
        case 'delete': {
          await interaction.deferReply({ ephemeral })

          const code = options.getString('code', true)
          const codeVerify = await db.payments.get(`${guildId}.cupons.${code.toLowerCase()}`)

          if (codeVerify === undefined) {
            await interaction.editReply({
              embeds: [
                new EmbedBuilder({
                  title: '❌ | Esse cupom não existe.'
                }).setColor('Red')
              ]
            })
          } else {
            const embedSucess = new EmbedBuilder({
              title: '✅ | Cupom deletado com sucesso.',
              fields: [
                {
                  name: '🎟️ | Código:',
                  value: codeBlock(code)
                }
              ]
            }).setColor('Green')

            await db.payments.delete(`${guildId}.cupons.${code.toLowerCase()}`)
              .then(async () => {
                await interaction.editReply({ embeds: [embedSucess] })

                if (logsChannel !== undefined) {
                  await logsChannel?.send({ embeds: [embedSucess] })
                }
              })
          }
          break
        }
      }
    } catch (error) {
      console.log(error)
    }
  }
})

export async function panelCupons (options: {
  interaction: ChatInputCommandInteraction<CacheType>
  channel?: TextChannel
}): Promise<void> {
  const { interaction, channel } = options
  const embed = new EmbedBuilder({
    title: '🎟️ | Configurar Cupons',
    description: 'Crie, Remova ou Edite os cupons'
  })

  const buttons = [
    await CustomButtonBuilder.create({
      permission: 'Admin',
      type: 'Cupom',
      customId: 'Add',
      emoji: '➕',
      label: 'Adicionar',
      style: ButtonStyle.Success
    }),
    await CustomButtonBuilder.create({
      permission: 'Admin',
      type: 'Cupom',
      customId: 'Rem',
      emoji: '✖️',
      label: 'Remover',
      style: ButtonStyle.Danger
    }),
    await CustomButtonBuilder.create({
      permission: 'Admin',
      type: 'Cupom',
      customId: 'List',
      emoji: '🗒️',
      label: 'Listar',
      style: ButtonStyle.Secondary
    })
  ]

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(...buttons)
  if (channel !== undefined) {
    await channel.send({
      components: [row],
      embeds: [embed]
    })
  } else {
    await interaction.editReply({
      components: [row],
      embeds: [embed]
    })
  }
}
