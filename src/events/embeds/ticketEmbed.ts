import { Event } from '@/structs/types/Event'
import { type TextChannel, ButtonStyle, ActionRowBuilder, ButtonBuilder, EmbedBuilder } from 'discord.js'
import { client, db } from '@/app'

export default new Event({
  name: 'ready',
  async run () {
    const guilds = client.guilds.cache
    for (const guild of guilds.values()) {
      const channelDB = String(await db.guilds.get(`${guild.id}.ticket.channel`))
      if (channelDB === null || channelDB === undefined) {
        console.log('Nenhuma Guilda encontrada!')
        return
      }
      const channel = guild?.channels.cache.get(channelDB) as TextChannel | undefined

      if (channel === undefined) return

      const embed = new EmbedBuilder()
        .setTitle('Pegue seu ticket!')
        .setDescription('Basta abrir seu ticket e aguardar um membro dê nossa equipe para lhe ajudar.')
        .setFooter({ text: `Equipe ${channel?.name}`, iconURL: (guild?.iconURL({ size: 64 }) ?? undefined) })
        .setColor('Green')

      const botao = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId('ticket')
          .setEmoji({ name: '📩' })
          .setLabel('Abra seu ticket')
          .setStyle(ButtonStyle.Success)
      )

      const msgTicket = await db.messages.get(`${guild?.id}.msg_ticket`) as string | undefined

      await channel?.messages.fetch(String(msgTicket))
        .then(async (msg) => {
          await msg?.edit({ embeds: [embed], components: [botao] })
            .then(() => {
              console.log('[ TICKET-SYSTEM ] Embed atualizada')
            })
        })
        .catch(async () => {
          await channel?.send({ embeds: [embed], components: [botao] })
            .then(async (msg) => {
              console.log('[ TICKET-SYSTEM ] Embed enviada')
              await db.messages.set(`${guild?.id}.msg_ticket`, msg.id)
              console.log('[ TICKET-SYSTEM ] Embed salva no database')
            })
        })
    }
  }
}
)
