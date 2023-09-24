import { EmbedBuilder, type CommandInteraction, type CacheType, TextChannel, CategoryChannel, ActionRowBuilder, ButtonBuilder, ButtonStyle, type ButtonInteraction } from 'discord.js'
import { db } from '@/app'
import { setSystem } from './setSystem'

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class Database {
  /**
   * Seta inforamções no database
   */
  public static async set (options: {
    interaction: CommandInteraction<CacheType>
    data: TextChannel | CategoryChannel | string
    typeDB?: 'guilds' | 'payments' | 'messages' | 'staff' | 'system'
    pathDB: string
    text?: string
  }): Promise<void> {
    const { interaction, data, text, typeDB, pathDB } = options
    const { user, guildId, channel } = interaction
    try {
      if (typeof data === 'string') {
        const { user, guildId, channel } = interaction
        await db[typeDB ?? 'guilds'].set(`${guildId}.${pathDB}`, data)

        try {
          const embedCategoriaSet = new EmbedBuilder()
            .setDescription('**✅ - Informação ' + '``' + data + '`` ' + `${text ?? 'foi atribuído a propriedade'} ${pathDB}!**`)
            .setColor('Green')
            .setAuthor({ name: `${user.username}`, iconURL: `${user.displayAvatarURL()}` })

          await interaction.editReply({ embeds: [embedCategoriaSet] })
        } catch (error) {
          console.log(error)
          await channel?.send({
            content: 'Ocorreu um erro!'
          })
        }
      } else if (data instanceof TextChannel || data instanceof CategoryChannel) {
        await db.guilds.set(`${guildId}.${pathDB}`, data.id)
        const embedCategoriaSet = new EmbedBuilder({
          description: `**✅ - ${data instanceof TextChannel ? 'Canal' : 'Categoria'} ` + '``' + data.name + '`` ' + (text ?? 'foi atribuído a propriedade') + '!**',
          author: { name: `${user.username}`, iconURL: `${user.displayAvatarURL()}` }
        }).setColor('Green')

        const button = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setLabel(`Click aqui para ir ao ${data.name}`)
            .setURL(`https://discord.com/channels/${guildId}/${data.id}`)
            .setStyle(ButtonStyle.Link)
        )

        if (data instanceof TextChannel) {
          await interaction.editReply({ embeds: [embedCategoriaSet], components: [button] })
        } else {
          await interaction.editReply({ embeds: [embedCategoriaSet] })
        }
      }
    } catch (error) {
      console.log(error)
      await channel?.send({
        content: 'Ocorreu um erro!'
      })
    }
  }

  /**
   * Seta e remove um determinada informação
   */
  public static async setDelete (options: {
    interaction: ButtonInteraction<CacheType>
    typeDB?: 'guilds' | 'payments' | 'messages' | 'staff' | 'system'
    pathDB: string
    systemName: string
    displayName?: string
    enabledType: 'switch' | string
    otherSystemNames?: string[]
  }): Promise<void> {
    const { interaction, typeDB, pathDB, displayName, systemName, enabledType, otherSystemNames } = options
    const dbInstance = db[typeDB ?? 'guilds']
    await interaction.deferReply({ ephemeral: true })
    const { guildId, user } = interaction

    try {
      const statusKey = `${guildId}.${pathDB}.${systemName}`
      const status = await dbInstance.get(statusKey) as boolean
      let activate: string | boolean
      let datatype: boolean = true

      if (enabledType === 'switch') {
        activate = true
      } else if (typeof enabledType === 'string') {
        activate = enabledType
      } else {
        datatype = (!status)
        activate = (!status)
      }

      await dbInstance.set(statusKey, activate)

      if (typeof activate === 'string' || activate) datatype = true

      const statusMsg = datatype
        ? `✅ | Sistema **\`${displayName ?? systemName}\`** foi definido como **${activate}**!`
        : `❌ | Sistema **\`${systemName}\`** foi Desativado!`

      const embedCategoriaSet = new EmbedBuilder({
        description: statusMsg,
        author: { name: user.username, iconURL: user.displayAvatarURL() }
      }).setColor(datatype ? 'Green' : 'Red')

      if (otherSystemNames !== undefined) {
        for (const otherSystem of otherSystemNames) {
          const key = `${guildId}.${pathDB}.${otherSystem}`
          console.log(`Deletando database: ${key}`)
          await dbInstance.delete(key)
          const result = await dbInstance.get(key)
          if (result !== undefined) {
            console.log(`Erro ao excluir a chave: ${key}`)
          }
        }
      }

      await interaction.editReply({ embeds: [embedCategoriaSet] })

      console.log(`Dados atuais do System: ${typeDB ?? 'system'}`, await dbInstance.get(`${guildId}.${pathDB}`))
      await setSystem(interaction)
    } catch (error) {
      console.log(error)
    }
  }
}
