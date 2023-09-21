import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, EmbedBuilder, PermissionsBitField, type CacheType, type CommandInteraction, type ButtonInteraction, type Collection, type OverwriteResolvable, type Snowflake, type StringSelectMenuInteraction } from 'discord.js'
import { db } from '@/app'
export async function createTicket (interaction: CommandInteraction<CacheType> | ButtonInteraction<CacheType> | StringSelectMenuInteraction<CacheType>, about: string): Promise<void> {
  const { guild, user } = interaction
  const nome = `🎫-${user.id}`
  const sendChannel = guild?.channels.cache.find((c) => c.name === nome)
  if (sendChannel !== undefined) {
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
          .setTitle(`Olá ${user.username}`)
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
          id: user.id,
          allow: [PermissionsBitField.Flags.ViewChannel]
        }
      ] as OverwriteResolvable[] | Collection<Snowflake, OverwriteResolvable>
      const ch = await guild?.channels.create({
        name: `🎫-${user.id}`,
        type: ChannelType.GuildText,
        topic: `Ticket do(a) ${user.username}, ID: ${user.id}`,
        permissionOverwrites,
        parent: await db.guilds.get(`${guild?.id}.ticket.category`)
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
            .setTitle(`Olá ${user.username}`)
            .setDescription('✅ | Seu ticket foi criado com sucesso!')
            .setColor('Green')
        ],
        components: [channel]
      })
      const embed = new EmbedBuilder()
        .setColor('Green')
        .setTitle('Descreva o que gostaria de saber e aguarde uma resposta.')
        .addFields(
          { name: '📃・Detalhes do Ticket:', value: about },
          {
            name: '👤 | Tomador do ticket:',
            value: `<@${user.id}>`
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
      if (roleDB !== undefined) {
        await ch?.send({ content: `<@&${roleDB}>`, embeds: [embed], components: [botao] }).catch(console.error)
      } else {
        await ch?.send({ embeds: [embed], components: [botao] }).catch(console.error)
      }
    } catch (all) {
      console.error(all)
      await interaction.editReply({
        content: '❗️ Ocorreu um erro interno, tente mais tarde.'
      })
    }
  }
}
