import { Event } from '@/structs/types/Event'
import { config } from '@/app'
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, EmbedBuilder, PermissionsBitField, type TextChannel } from 'discord.js'
export default new Event({
  name: 'interactionCreate',
  async run (interaction) {
    if (interaction.isButton()) {
      if (interaction.customId === 'ticket') {
        const { guild } = interaction
        const nome = `🎫-${interaction.user.id}`
        const sendChannel = guild?.channels.cache.find((c) => c.name === nome) as TextChannel
        if (sendChannel != null) {
          const channel = new ActionRowBuilder<any>().addComponents(
            new ButtonBuilder()
              .setLabel('Clique para ir ao seu ticket')
              .setURL(
                    `https://discord.com/channels/${guild?.id}/${sendChannel.id}`
              )
              .setStyle(ButtonStyle.Link)
          )

          await interaction.reply({
            content: `Olá ${interaction.user.username}\n❌ | Você já possui um ticket aberto!`,
            components: [channel],
            ephemeral: true
          })
        } else {
          await interaction.deferReply({ ephemeral: true })
          try {
            const ch = await guild?.channels.create({
              name: `🎫-${interaction.user.username}`,
              type: ChannelType.GuildText,
              topic: `Ticket do(a) ${interaction.user.username}, ID: ${interaction.user.id}`,
              permissionOverwrites: [
                {
                  id: guild?.id,
                  deny: [PermissionsBitField.Flags.ViewChannel]
                },
                {
                  id: interaction.user.id,
                  allow: [PermissionsBitField.Flags.ViewChannel]
                }
              ],
              parent: config.Slash.Ticket.ID
            })

            const channel = new ActionRowBuilder<any>().addComponents(
              new ButtonBuilder()
                .setLabel('Clique para ir ao seu Ticket')
                .setURL(
                      `https://discord.com/channels/${ch?.guild.id}/${ch?.id}`
                )
                .setStyle(ButtonStyle.Link)
            )
            await interaction.editReply({
              content: `Olá ${interaction.user.username}\n✅ | Seu ticket foi criado com sucesso!`,
              components: [channel]
            })
            const embed = new EmbedBuilder()
              .setColor('Green')
              .setTitle('📃・Detalhes do Ticket')
              .addFields(
                {
                  name: '❤️ | Obrigado por entrar em contato com o suporte.',
                  value: 'Descreva seu problema e aguarde uma resposta.',
                  inline: false
                },
                {
                  name: '👤 | User:',
                  value: `<@${interaction.user.id}>`
                },
                {
                  name: '🕗 | Aberto em:',
                  value: new Date().toLocaleString('pt-BR', {
                    timeZone: 'America/Sao_Paulo'
                  })
                }
              )
              .setFooter({ text: 'Caso ninguém responda seu ticket em 10 minutos marque algum staff' })

            const botao = new ActionRowBuilder<any>().addComponents(
              new ButtonBuilder()
                .setCustomId('del-ticket')
                .setEmoji({ name: '✖️' })
                .setLabel('Fechar Ticket')
                .setStyle(ButtonStyle.Danger)
            )
            await ch?.send({ embeds: [embed], components: [botao] }).catch(console.error)
          } catch (all) {
            console.error(all)
            await interaction.editReply({
              content: '❗️ Ocorreu um erro interno, tente mais tarde.'
            })
          }
        }
      } else if (interaction.customId === 'del-ticket') {
        await interaction.reply({
          content: `Olá ${interaction.user.username}\n❗️ | Seu ticket será excluído em 5 segundos.`,
          ephemeral: true
        })

        setTimeout(() => {
          interaction?.channel?.delete().catch(console.error)
        }, 5000)
      }
    }
  }
})
