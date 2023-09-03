import { Event } from '@/structs/types/Event'
import { type TextChannel, ButtonStyle, ActionRowBuilder, ButtonBuilder, EmbedBuilder } from 'discord.js'
import { client, config, db } from '@/app'

export default new Event({
  name: 'ready',
  async run () {
    const guild = client.guilds.cache.get(config.Guild.ID)

    if (guild === null) {
      console.log('Guild não encontrada')
      return
    }

    const channelDB = String(await db.guilds.get(`${config.Guild.ID}.channel_ticket`))
    const channel = guild?.channels.cache.get(channelDB) as TextChannel

    const embed = new EmbedBuilder()
    .setTitle('Pegue seu ticket!')
    .setDescription('Basta abrir seu ticket e aguardar um membro dê nossa equipe para lhe ajudar.')
    .setFooter({ text: `Equipe ${channel?.name}`, iconURL: String(guild?.iconURL({ size: 64 })) })
    .setColor('Green')

  const botao = new ActionRowBuilder<any>().addComponents(
    new ButtonBuilder()
      .setCustomId('ticket')
      .setEmoji({ name: '📩' })
      .setLabel('Abra seu ticket')
      .setStyle(ButtonStyle.Success)
  )

    const msgTicket = await db.messages.get(`${guild?.id}.msg_ticket`)
    console.log(msgTicket)

    try {
      if (msgTicket !== undefined) {
        console.log('[ TICKET-SYSTEM ] Embed Atualizada')
        const msg = await channel?.messages.fetch(msgTicket)
        await msg?.edit({ embeds: [embed], components: [botao] })
      } else {
        console.log('[ TICKET-SYSTEM ] Embed Enviada')
        const msg = await channel?.send({ embeds: [embed], components: [botao] })
        await db.messages.set(`${guild?.id}.msg_ticket`, msg.id)
        console.log('[ TICKET-SYSTEM ] Embed Salva no Database')
      }
    } catch (error) {
      console.error(error)
    }
  }
})
