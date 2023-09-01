import { EmbedBuilder, ApplicationCommandOptionType, ApplicationCommandType, type TextChannel, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js'
import { Command } from '@/structs/types/Command'
import { LogsDiscord } from '@/app'
import createTicket from '@/events/commands/utils/createTicket'

export default new Command({
  name: 'ticket',
  description: 'Abrir Ticket',
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'canal',
      description: '[ADM] Canal onde será enviada a embed',
      required: false,
      type: ApplicationCommandOptionType.Channel
    }
  ],
  async run ({ interaction, options }) {
    const channel = options.getChannel('canal')
    const { guild } = interaction
    const sendChannel = guild?.channels.cache.get(String(channel?.id)) as TextChannel

    if (channel === null) {
      await createTicket(interaction)
      return
    }

    await interaction.deferReply({ ephemeral: true })

    if ((interaction?.memberPermissions?.has('Administrator')) === false) {
      await interaction.editReply({
        content: 'Você não tem permissão para usar esse comando!'
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
    try {
      const embed = new EmbedBuilder()
        .setTitle('Pegue Seu Ticket!')
        .setDescription('Basta abrir seu ticket e esperar para falar com nosso suporte.')
        .setFooter({ text: `Equipe ${interaction.guild?.name}`, iconURL: String(interaction.guild?.iconURL({ size: 64 })) })
        .setColor('Green')

      const botao = new ActionRowBuilder<any>().addComponents(
        new ButtonBuilder()
          .setCustomId('ticket')
          .setEmoji({ name: '📩' })
          .setLabel('Abra seu Ticket')
          .setStyle(ButtonStyle.Success)
      )

      if (sendChannel !== undefined) {
        await sendChannel.send({ embeds: [embed], components: [botao] })
        .then(async () => {
          await interaction.editReply({ 
            embeds: [
              new EmbedBuilder()
              .setDescription(`✅ | Mensagem enviada com sucesso ao chat: ${sendChannel}`)
              .setColor('Green')
            ],
            components: [
              new ActionRowBuilder<any>().addComponents(
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
