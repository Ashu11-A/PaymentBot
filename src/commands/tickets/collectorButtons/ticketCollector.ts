import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, EmbedBuilder, PermissionsBitField, type TextChannel, type CacheType, type CommandInteraction, type ButtonInteraction, type Collection, type OverwriteResolvable, type Snowflake } from 'discord.js'
import { db } from '@/app'
export async function ticketCollector (interaction: CommandInteraction<CacheType> | ButtonInteraction<CacheType>): Promise<void> {
  const { guild } = interaction
  const nome = `🎫-${interaction.user.username}`
  const sendChannel = guild?.channels.cache.find((c) => c.name === nome) as TextChannel
  if (sendChannel != null) {
    const buttonChannel = new ActionRowBuilder<ButtonBuilder>().addComponents(
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

    const enabled = await db.system.get(`${interaction.guild?.id}.status.systemTicket`)
    if (enabled !== undefined && enabled === false) {
      await interaction.editReply({ content: '❌ | Os tickets estão desativados no momento!' })
      return
    }

    const roleDB = await db.guilds.get(`${interaction.guild?.id}.ticket.role`)
    try {
      const permissionOverwrites = [
        {
          id: guild?.id,
          deny: [PermissionsBitField.Flags.ViewChannel]
        },
        {
          id: interaction.user.id,
          allow: [PermissionsBitField.Flags.ViewChannel]
        },
        {
          id: '1144009037097222144',
          allow: [PermissionsBitField.Flags.ViewChannel]
        },
        {
          id: '1144008994499870761',
          allow: [PermissionsBitField.Flags.ViewChannel]
        },
        {
          id: '1144009942584545454',
          allow: [PermissionsBitField.Flags.ViewChannel]
        }
      ] as OverwriteResolvable[] | Collection<Snowflake, OverwriteResolvable>
      const ch = await guild?.channels.create({
        name: `🎫-${interaction.user.username}`,
        type: ChannelType.GuildText,
        topic: `Ticket do(a) ${interaction.user.username}, ID: ${interaction.user.id}`,
        permissionOverwrites,
        parent: await db.guilds.get(`${interaction?.guild?.id}.ticket.category`)
      })
      const channel = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setLabel('Clique para ir ao seu ticket')
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
        .setTitle('❤️ | Obrigado por entrar em contato com o suporte.')
        .setDescription('Descreva seu problema e aguarde uma resposta.\n \n**📃・Detalhes do Ticket:**')
        .addFields(
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
        .setFooter({ text: `Equipe ${interaction.guild?.name}`, iconURL: (interaction?.guild?.iconURL({ size: 64 }) ?? undefined) })

      const botao = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId('del-ticket')
          .setEmoji({ name: '✖️' })
          .setLabel('Fechar Ticket')
          .setStyle(ButtonStyle.Danger)
      )
      await ch?.send({ content: `<@&${roleDB}>`, embeds: [embed], components: [botao] }).catch(console.error)
    } catch (all) {
      console.error(all)
      await interaction.editReply({
        content: '❗️ Ocorreu um erro interno, tente mais tarde.'
      })
    }
  }
}