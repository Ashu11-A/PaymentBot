import { EmbedBuilder, type CommandInteraction, type CacheType, type TextChannel, type CategoryChannel, ActionRowBuilder, ButtonBuilder, ButtonStyle, type ButtonInteraction } from 'discord.js'
import { db } from '@/app'
import { setSystem } from './setSystem'

export async function setDatabase (interaction: CommandInteraction<CacheType>, typeChannel: TextChannel | CategoryChannel, typeData: string, typeString: string, text: string): Promise<void> {
  const { user, guild, channel } = interaction

  console.log(`${guild?.id}.${typeData}.${typeString}`, (typeChannel?.id))

  await db.guilds.set(`${guild?.id}.${typeData}.${typeString}`, typeChannel?.id)
  try {
    const embedCategoriaSet = new EmbedBuilder()
      .setDescription(`**✅ - ${typeData === 'channel' ? 'Canal' : 'Categoria'} ` + '``' + typeChannel?.name + '`` ' + text + '!**')
      .setColor('Green')
      .setAuthor({ name: `${user.username}`, iconURL: `${user.displayAvatarURL()}` })

    const button = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setLabel(`Click aqui para ir ao ${typeChannel?.name}`)
        .setURL(`https://discord.com/channels/${guild?.id}/${typeChannel.id}`)
        .setStyle(ButtonStyle.Link)
    )

    if (typeData === 'channel') {
      await interaction?.editReply({ embeds: [embedCategoriaSet], components: [button] })
    } else {
      await interaction?.editReply({ embeds: [embedCategoriaSet] })
    }
  } catch (error) {
    console.log(error)
    await channel?.send({
      content: 'Ocorreu um erro!'
    })
  }
}

export async function setDatabaseString (interaction: CommandInteraction<CacheType>, data: string, typeData: string, systemName: string, displayText: string): Promise<void> {
  const { user, guild, channel } = interaction
  await db.guilds.set(`${guild?.id}.${typeData}.${systemName}`, data)

  try {
    const embedCategoriaSet = new EmbedBuilder()
      .setDescription('**✅ - Informação ' + '``' + data + '`` ' + `${displayText} ${typeData}.${systemName}!**`)
      .setColor('Green')
      .setAuthor({ name: `${user.username}`, iconURL: `${user.displayAvatarURL()}` })

    await interaction?.editReply({ embeds: [embedCategoriaSet] })
  } catch (error) {
    console.log(error)
    await channel?.send({
      content: 'Ocorreu um erro!'
    })
  }
}

export async function setDatabaseSystem (interaction: ButtonInteraction<CacheType>, typeData: string, systemName: string, displayName: string): Promise<void> {
  const { user, guild } = interaction
  let status = await db.system.get(`${guild?.id}.${typeData}.${systemName}`)
  let msg: string
  if (systemName === 'systemStatusMinecraft' || systemName === 'systemStatusString') {
    if (systemName === 'systemStatusMinecraft') {
      msg = '**✅ | Sistema' + '``' + displayName + '``' + 'foi Ativado!**'
      await db.system.set(`${guild?.id}.${typeData}.systemStatusMinecraft`, true)
      await db.system.delete(`${guild?.id}.${typeData}.systemStatusString`)
    } else {
      msg = '**✅ | Sistema' + '``' + displayName + '``' + 'foi Ativado!**'
      await db.system.delete(`${guild?.id}.${typeData}.systemStatusMinecraft`)
      await db.system.set(`${guild?.id}.${typeData}.systemStatusString`, true)
    }
  } else if (status === undefined || status === false) {
    status = true
    msg = '**✅ | Sistema' + '``' + displayName + '``' + 'foi Ativado!**'
    await db.system.set(`${guild?.id}.${typeData}.${systemName}`, status)
  } else {
    status = false
    msg = '**❌ | Sistema' + '``' + displayName + '``' + 'foi Desativado!**'
    await db.system.set(`${guild?.id}.${typeData}.${systemName}`, status)
  }

  try {
    const embedCategoriaSet = new EmbedBuilder()
      .setDescription(msg)
      .setColor((status === true ? 'Green' : 'Red'))
      .setAuthor({ name: `${user.username}`, iconURL: `${user.displayAvatarURL()}` })

    await interaction?.editReply({ embeds: [embedCategoriaSet] })
    await setSystem(interaction)
  } catch (error) {
    console.log(error)
    await interaction?.reply({
      content: 'Ocorreu um erro!'
    })
  }
}
