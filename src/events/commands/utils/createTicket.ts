import { ActionRowBuilder, ButtonBuilder, type ButtonInteraction, ButtonStyle, type CacheType, ChannelType, type ChatInputCommandInteraction, type CommandInteraction, EmbedBuilder, type MessageContextMenuCommandInteraction, PermissionsBitField, type TextChannel, type UserContextMenuCommandInteraction } from 'discord.js'
import { config, db } from '@/app'

export default async function createTicket (interaction: ChatInputCommandInteraction<CacheType> | MessageContextMenuCommandInteraction<CacheType> | UserContextMenuCommandInteraction<any> | ButtonInteraction<CacheType> | CommandInteraction<CacheType>): Promise<void> {
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
          .setTitle(`Olá ${interaction.user.username}`)
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
        parent: await db.guilds.get(`${interaction?.guild?.id}.category_ticket`)
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
            .setTitle(`Olá ${interaction.user.username}`)
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
}
