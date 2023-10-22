import { db } from '@/app'
import { Command } from '@/discord/base'
import { Discord } from '@/functions'
import { ApplicationCommandOptionType, ApplicationCommandType, EmbedBuilder, type TextChannel, codeBlock } from 'discord.js'

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
    }
  ],
  async run (interaction) {
    const havePermision = await Discord.Permission(interaction, 'Administrator')
    const { options, guildId, user, guild } = interaction
    const logsDB = await db.guilds.get(`${guildId}.channel.logs`) as string
    const logsChannel = guild.channels.cache.get(logsDB) as TextChannel | undefined

    if (havePermision) return

    try {
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
