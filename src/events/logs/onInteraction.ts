import { Event } from '@/structs/types/Event'
import { config } from '@/app'
import { type TextChannel, time, EmbedBuilder } from 'discord.js'

export default new Event({
  name: 'interactionCreate',
  async run (interaction) {
    if (!interaction.inCachedGuild()) return

    if (interaction.isCommand()) {
      const logsChannel = interaction.guild.channels.cache.get(config.Logs.channel)
      if ((logsChannel?.isTextBased()) === false) return
      const { channel, user, commandName, createdAt, commandType } = interaction
      const emojis = ['⌨️', '👤', '✉️']
      const text = [
        'Executou o comando:',
        'Usou o contexto de usuário:',
        'Usou o contexto de mensagem:'
      ]
      const embed = new EmbedBuilder()
        .setTitle(`Usuário <@${user.username}>`)
        .addFields(
          {
            name: `**⚙️ ${text[commandType - 1]}**`,
            value: ` \`${commandName}\` `,
            inline: false
          },
          {
            name: `**${emojis[commandType - 1]} há:**`,
            value: `${time(createdAt, 'R')}`,
            inline: false
          }

        )
        .setColor('White')

      if (channel != null) embed.addFields({ name: '💬 No chat:', value: channel.url, inline: false })

      void (logsChannel as TextChannel).send({ embeds: [embed] })
    }
  }
})
