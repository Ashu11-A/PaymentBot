import { Event } from '@/structs/types/Event'
import { config } from '@/app'
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, ComponentType, EmbedBuilder, PermissionsBitField, type TextChannel } from 'discord.js'
import { createRow } from '@/utils/Discord'
export default new Event({
  name: 'interactionCreate',
  async run(interaction) {
    if (interaction.isButton()) {
      if (interaction.customId === 'ticket') {
        const { guild } = interaction
        const nome = `🎫-${interaction.user.username}`
        const sendChannel = guild?.channels.cache.find((c) => c.name === nome) as TextChannel
        if (sendChannel != null) {
          const buttonChannel = new ActionRowBuilder<any>().addComponents(
            new ButtonBuilder()
              .setLabel('Clique para ir ao seu ticket')
              .setURL(
                `https://discord.com/channels/${guild?.id}/${sendChannel.id}`
              )
              .setStyle(ButtonStyle.Link)
          )

          await interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setTitle(`Olá ${interaction.user.username}`,)
                .setDescription('❌ | Você já possui um ticket aberto!')
                .setColor('Red')
            ],
            components: [buttonChannel],
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
              parent: config.Slash.Ticket.idCategoryChannel
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
              embeds: [
                new EmbedBuilder()
                  .setTitle(`Olá ${interaction.user.username}`,)
                  .setDescription('✅ | Seu ticket foi criado com sucesso!')
                  .setColor('Green')
              ],
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
              .setFooter({ text: `Equipe ${interaction.guild?.name}`, iconURL: String(interaction.guild?.iconURL({ size: 64 })) })
              .setTimestamp()

            const botao = new ActionRowBuilder<any>().addComponents(
              new ButtonBuilder()
                .setCustomId('del-ticket')
                .setEmoji({ name: '✖️' })
                .setLabel('Fechar Ticket')
                .setStyle(ButtonStyle.Danger)
            )
            await ch?.send({ content: `<@&${config.Slash.Ticket.idRole}>`, embeds: [embed], components: [botao] }).catch(console.error)
          } catch (all) {
            console.error(all)
            await interaction.editReply({
              content: '❗️ Ocorreu um erro interno, tente mais tarde.'
            })
          }
        }
      } else if (interaction.customId === 'del-ticket') {
        await interaction.deferReply({ ephemeral: true })
        const message = await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setDescription('Tem certeza que deseja fechar o Ticket?')
              .setColor('Gold')
          ],
          components: [createRow(
            new ButtonBuilder({ custom_id: 'embed-confirm-button', label: 'Confirmar', style: ButtonStyle.Success }),
            new ButtonBuilder({ custom_id: 'embed-cancel-button', label: 'Cancelar', style: ButtonStyle.Danger })
          )]
        })
        const collector = message.createMessageComponentCollector({ componentType: ComponentType.Button })
        collector.on('collect', async subInteraction => {
          collector.stop()
          const clearData = { components: [], embeds: [] }

          if (subInteraction.customId === 'embed-cancel-button') {
            await subInteraction.update({
              ...clearData,
              embeds: [
                new EmbedBuilder()
                  .setDescription('Você cancelou a ação')
                  .setColor("Green")
              ]
            })
            return
          } else if (subInteraction.customId === 'embed-confirm-button') {
            await subInteraction.update({
              ...clearData,
              embeds: [
                new EmbedBuilder()
                  .setTitle(`👋 | Olá ${interaction.user.username}`)
                  .setDescription('❗️ | Seu ticket será excluído em 5 segundos.')
                  .setColor('Red')
              ]
            })
            setTimeout(() => {
              subInteraction?.channel?.delete().catch(console.error)
            }, 5000)
          }
        })
      }
    }
  }
})
