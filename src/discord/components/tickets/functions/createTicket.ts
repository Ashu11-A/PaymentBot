import { ActionRowBuilder, type ButtonBuilder, ButtonStyle, ChannelType, EmbedBuilder, PermissionsBitField, type CacheType, type CommandInteraction, type ButtonInteraction, type Collection, type OverwriteResolvable, type Snowflake, type StringSelectMenuInteraction } from 'discord.js'
import { db } from '@/app'
import { CustomButtonBuilder, Discord } from '@/functions'

export async function createTicket (interaction: CommandInteraction<CacheType> | ButtonInteraction<CacheType> | StringSelectMenuInteraction<CacheType>, about: string): Promise<void> {
  const { guild, user, guildId } = interaction
  const nome = `🎫-${user.id}`
  const sendChannel = guild?.channels.cache.find((c) => c.name === nome)
  if (sendChannel !== undefined) {
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle(`Olá ${user.username}`)
          .setDescription('❌ | Você já possui um ticket aberto!')
          .setColor('Red')
      ],
      components: [
        await Discord.buttonRedirect({
          guildId,
          channelId: sendChannel.id,
          emoji: '🎫',
          label: 'Ir ao Ticket'
        })
      ],
      ephemeral: true
    })
  } else {
    await interaction.deferReply({ ephemeral: true })
    const status = await db.system.get(`${interaction.guild?.id}.status`)
    const ticket = await db.guilds.get(`${interaction.guild?.id}.ticket`)

    if (status?.systemTicket !== undefined && status.systemTicket === false) {
      await interaction.editReply({ content: '❌ | Os tickets estão desativados no momento!' })
      return
    }

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

      /* Cria o chat do Ticket */
      const category = interaction.guild?.channels.cache.find(category => category.type === ChannelType.GuildCategory && category.id === ticket?.category)
      const ch = await guild?.channels.create({
        name: `🎫-${user.id}`,
        type: ChannelType.GuildText,
        topic: `Ticket do(a) ${user.username}, ID: ${user.id}`,
        permissionOverwrites,
        parent: category?.id
      })

      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle(`Olá ${user.username}`)
            .setDescription('✅ | Seu ticket foi criado com sucesso!')
            .setColor('Green')
        ],
        components: [
          await Discord.buttonRedirect({
            guildId,
            channelId: ch?.id,
            emoji: '🎫',
            label: 'Ir ao Ticket'
          })
        ]
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
        await CustomButtonBuilder.create({
          customId: 'del-ticket',
          label: 'Fechar Ticket',
          emoji: '✖️',
          style: ButtonStyle.Danger
        })
      )
      if (ticket?.role !== undefined) {
        await ch?.send({ content: `<@&${ticket.role}>`, embeds: [embed], components: [botao] }).catch(console.error)
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
