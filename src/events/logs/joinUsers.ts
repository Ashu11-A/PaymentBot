import { Event } from '@/structs/types/Event'
import { db } from '@/app'
import { type TextChannel, EmbedBuilder } from 'discord.js'

export default new Event({
  name: 'guildMemberAdd',
  async run (interaction) {
    console.log(`Um novo usuário entrou no servidor: | ${interaction.guild.name} | ${interaction.user.username}`)
    try {
      const enabled = await db.system.get(`${interaction.guild?.id}.status.systemWelcomer`)
      if (enabled !== undefined && enabled === false) return

      const channelDB = await db.guilds.get(`${interaction?.guild?.id}.channel.entrada`) as string
      const suportDB = await db.guilds.get(`${interaction?.guild?.id}.ticket.channel`) as string

      const sendChannel = interaction.guild?.channels.cache.get(channelDB)
      const ticketChannel = interaction.guild?.channels.cache.get(suportDB)

      const { user } = interaction
      const embed = new EmbedBuilder()
        .setTitle(`${user.username} | Bem-vindo(a)!`)
        .setDescription(`🥰 Olá, seja bem-vindo(a) a ${interaction.guild.name}!`)
        .addFields(
          {
            name: '👋 Sabia que...',
            value: `Você é o ${interaction.guild.memberCount}º membro aqui no servidor?`,
            inline: true
          },
          {
            name: '🛡 Tag do Usuário',
            value: '``' + interaction.user.username + '``' + `(${interaction.user.id})`,
            inline: true
          },
          {
            name: '📛 Precisando de ajuda?',
            value: `Caso você tenha alguma dúvida ou problema, chame a nossa equipe em <#${ticketChannel?.id}>!`,
            inline: true
          }
        )
        .setColor('Green')
        .setFooter({ text: `Equipe ${interaction.guild?.name}`, iconURL: String(interaction.guild.iconURL({ size: 64 })) })
        .setThumbnail(String(interaction.user.avatarURL({ size: 512 })))

      if (sendChannel !== null) {
        await (sendChannel as TextChannel).send({ embeds: [embed] })
      }
    } catch (err) {
      console.log(err)
    }
  }
})
