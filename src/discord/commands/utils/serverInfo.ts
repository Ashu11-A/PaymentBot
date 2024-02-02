import { db } from '@/app'
import { Command } from '@/discord/base'
import { ApplicationCommandType, ChannelType, EmbedBuilder } from 'discord.js'

new Command({
  name: 'serverinfo',
  description: '[ 🪄 Utilidades ] Mostra informações sobre o servidor',
  dmPermission,
  type: ApplicationCommandType.ChatInput,
  async run (interaction) {
    const { guildId, guild } = interaction
    const { site, loja } = await db.guilds.get(`${guildId}.urls`)
    const iconURL = interaction?.guild?.iconURL({ size: 64 }) ?? undefined
    const embed = new EmbedBuilder({
      author: { iconURL, name: guild?.name ?? 'Error' },
      fields: [
        { name: 'Dono', value: `<@${guild?.ownerId}>`, inline: true },
        {
          name: 'Membros',
          value: String(guild?.memberCount),
          inline: true
        },
        {
          name: 'Cargos',
          value: String(guild?.roles.cache.size),
          inline: true
        },
        {
          name: 'Categorias',
          value: String(guild?.channels.cache.filter((channels) => channels.type === ChannelType.GuildCategory).size),
          inline: true
        },
        {
          name: 'Canais de texto',
          value: String(guild?.channels.cache.filter((channel) => channel.type === ChannelType.GuildText).size),
          inline: true
        },
        {
          name: 'Canais de Áudio',
          value: String(guild?.channels.cache.filter((channel) => channel.type === ChannelType.GuildVoice).size),
          inline: true
        }
      ],
      footer: {
        text: `ID: ${interaction.channelId} | Servidor Criado em ${
          guild?.createdAt.toLocaleDateString('pt-BR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })}`
      }
    }).setColor('Blurple')

    if (iconURL !== undefined) {
      embed.setThumbnail(guild?.iconURL() as string)
    }
    if (site !== undefined) {
      embed.addFields('Site', site)
    }
    if (loja !== undefined) {
      embed.addFields('Loja', loja)
    }

    await interaction.reply({
      ephemeral: true,
      embeds: [embed]
    })
  }
})
