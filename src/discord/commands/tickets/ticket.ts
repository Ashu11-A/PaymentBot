import { EmbedBuilder, ApplicationCommandOptionType, ApplicationCommandType, type TextChannel, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js'
import { Command } from '@/discord/base'
import { db } from '@/app'
import { ticketButtonsConfig, createTicket } from '@/discord/components/tickets'
import { Discord } from '@/functions'

new Command({
  name: 'ticket',
  description: '[ 🎫 Ticket ] Abrir Ticket',
  type: ApplicationCommandType.ChatInput,
  dmPermission,
  options: [
    {
      name: 'panel-embed',
      description: '[ADM] Envia a embed de configuração.',
      required: false,
      type: ApplicationCommandOptionType.Channel
    }
  ],
  async run (interaction) {
    const { guild, guildId, channelId, options } = interaction
    const channel = options.getChannel('panel-embed')
    const sendChannel = guild?.channels.cache.get(String(channel?.id)) as TextChannel

    if (channel === null) {
      await createTicket(interaction, 'Ticket aberto por meio do comando /ticket')
      return
    }

    await interaction.deferReply({ ephemeral: true })

    const havePermision = await Discord.Permission(interaction, 'Administrator')
    if (havePermision) return

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
  }
})
