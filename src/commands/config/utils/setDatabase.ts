import { EmbedBuilder, type CommandInteraction, type CacheType, type TextChannel, type CategoryChannel, ActionRowBuilder, ButtonBuilder, ButtonStyle, type ButtonInteraction, type Guild, type User } from 'discord.js'
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

async function updateSystemStatusAndClearOthers (
  interaction: ButtonInteraction<CacheType>,
  guild: Guild | null,
  typeData: string,
  systemName: string,
  enabledType: string | null,
  displayName: string,
  user: User,
  otherSystemNames: string[]
): Promise<void> {
  const statusKey = `${guild?.id}.${typeData}.${systemName}`
  const status = await db.system.get(statusKey) as boolean

  let activate: boolean

  if (enabledType === 'switch') {
    activate = true
  } else {
    activate = (!status)
  }

  await db.system.set(statusKey, activate)

  const statusMsg = activate
    ? `✅ | Sistema **\`${displayName}\`** foi Ativado!`
    : `❌ | Sistema **\`${displayName}\`** foi Desativado!`

  const embedCategoriaSet = new EmbedBuilder()
    .setDescription(statusMsg)
    .setColor(activate ? 'Green' : 'Red')
    .setAuthor({ name: user.username, iconURL: user.displayAvatarURL() })

  for (const otherSystem of otherSystemNames) {
    const key = `${guild?.id}.${typeData}.${otherSystem}`
    console.log(`Deletando database: ${key}`)
    await db.system.delete(key)
    const result = await db.system.get(key)
    if (result !== undefined) {
      console.log(`Erro ao excluir a chave: ${key}`)
    }
  }

  await interaction.editReply({ embeds: [embedCategoriaSet] })
}

export async function setDatabaseSystem (
  interaction: ButtonInteraction<CacheType>,
  typeData: string,
  systemName: string,
  displayName: string
): Promise<void> {
  await interaction.deferReply({ ephemeral: true })
  const { user, guild } = interaction

  type SystemActions = Record<string, () => Promise<void>>

  try {
    const systemActions: SystemActions = {
      systemStatusMinecraft: async () => {
        await updateSystemStatusAndClearOthers(interaction, guild, typeData, 'systemStatusMinecraft', 'switch', displayName, user,
          ['systemStatusString'])
      },
      systemStatusString: async () => {
        await updateSystemStatusAndClearOthers(interaction, guild, typeData, 'systemStatusString', 'switch', displayName, user,
          ['systemStatusMinecraft'])
      },
      systemStatusOnline: async () => {
        await updateSystemStatusAndClearOthers(interaction, guild, typeData, 'systemStatusOnline', 'switch', displayName, user,
          ['systemStatusAusente', 'systemStatusNoPerturbe', 'systemStatusInvisível']
        )
      },
      systemStatusAusente: async () => {
        await updateSystemStatusAndClearOthers(interaction, guild, typeData, 'systemStatusAusente', 'switch', displayName, user,
          ['systemStatusOnline', 'systemStatusNoPerturbe', 'systemStatusInvisível']
        )
      },
      systemStatusNoPerturbe: async () => {
        await updateSystemStatusAndClearOthers(interaction, guild, typeData, 'systemStatusNoPerturbe', 'switch', displayName, user,
          ['systemStatusOnline', 'systemStatusAusente', 'systemStatusInvisível']
        )
      },
      systemStatusInvisível: async () => {
        await updateSystemStatusAndClearOthers(interaction, guild, typeData, 'systemStatusInvisível', 'switch', displayName, user,
          ['systemStatusOnline', 'systemStatusAusente', 'systemStatusNoPerturbe']
        )
      }
    }

    if (systemName in systemActions) {
      await systemActions[systemName]()
    } else {
      await updateSystemStatusAndClearOthers(interaction, guild, typeData, systemName, null, displayName, user, [])
    }
    console.log(await db.system.get(`${guild?.id}.${typeData}`))
    await setSystem(interaction)
  } catch (error) {
    console.log(error)
  }
}
