import { EmbedBuilder, type CommandInteraction, type CacheType, type TextChannel, type CategoryChannel, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js'
import { db } from '@/app'

export default async function setChannelDatabase (interaction: CommandInteraction<CacheType>, typeChannel: TextChannel | CategoryChannel, typeData: string, typeString: string, text: string): Promise<void> {
  const { user, guild, channel } = interaction

  await db.guilds.set(`${guild?.id}.${typeData}_${typeString}`, typeChannel?.id)
  try {
    const embedCategoriaSet = new EmbedBuilder()
      .setDescription(`**✅ - ${typeData === 'channel' ? 'Canal' : 'Categoria'} ` + '``' + typeChannel?.name + '`` ' + text + '!**')
      .setColor('Green')
      .setAuthor({ name: `${user.username}`, iconURL: `${user.displayAvatarURL()}` })

    let button: any
    if (typeData === 'channel') {
      button = new ActionRowBuilder<any>().addComponents(
        new ButtonBuilder()
          .setLabel(`Click aqui para ir ao ${typeChannel?.name}`)
          .setURL(`https://discord.com/channels/${guild?.id}/${typeChannel.id}`)
          .setStyle(ButtonStyle.Link)
      )
    }

    await channel?.send({ embeds: [embedCategoriaSet], components: [button] })
  } catch (error) {
    console.log(error)
    await channel?.send({
      content: 'Ocorreu um erro!'
    })
  }
}
