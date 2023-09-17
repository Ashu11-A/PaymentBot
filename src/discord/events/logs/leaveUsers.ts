import { Event } from '@/discord/base'
import { db } from '@/app'
import { type TextChannel, EmbedBuilder } from 'discord.js'

export default new Event({
  name: 'guildMemberRemove',
  async run (interaction) {
    console.log(`Um usuário saiu do servidor: | ${interaction.guild.name} | ${interaction.user.username}`)
    try {
      const channelDB = await db.guilds.get(`${interaction?.guild?.id}.channel.saída`) as string
      const channelStaffDB = await db.guilds.get(`${interaction?.guild?.id}.channel.staff_logs`) as string

      if (channelDB === undefined) return

      const sendChannel = interaction.guild?.channels.cache.get(channelDB) as TextChannel | undefined
      const sendStaffChannel = interaction?.guild.channels.cache.get(channelStaffDB) as TextChannel | undefined

      const userStaff = await db.staff.get(`${interaction.guild.id}.members.${interaction.user.id}`)

      if (userStaff !== undefined) {
        console.log('membro da equipe encontado, removendo...')
        const embed = new EmbedBuilder()
          .setColor('Red')
          .setTitle('📰 | STAFF LOG')
          .setDescription(
            `<@${interaction.user.id}> não integra mais a equipe.`
          )
          .setFooter({ text: `Equipe ${interaction.guild?.name}` })
          .setTimestamp()

        if (sendStaffChannel !== undefined) {
          await sendStaffChannel.send({ embeds: [embed] })
        }
        await db.staff.delete(`${interaction.guild.id}.members.staff.${interaction.user.id}`)
      }

      const enabled = await db.system.get(`${interaction.guild?.id}.status.systemWelcomer`)
      if (enabled !== undefined && enabled === false) return

      const { user } = interaction
      const embed = new EmbedBuilder()
        .setDescription(`Usuário ${user.username}, saiu do servidor!`)
        .setColor('Random')
        .setFooter({ text: `Equipe ${interaction.guild?.name}`, iconURL: (interaction.guild.iconURL({ size: 64 }) ?? undefined) })

      if (sendChannel !== undefined) {
        await sendChannel.send({ embeds: [embed] })
      }
    } catch (err) {
      console.log(err)
    }
  }
})
