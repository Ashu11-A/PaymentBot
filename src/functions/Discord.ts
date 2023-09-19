import { db } from '@/app'
import { type AnyComponentBuilder, ActionRowBuilder, type ColorResolvable, type TextChannel, type CommandInteraction, type MessageInteraction, type Guild, EmbedBuilder, type CacheType, type PermissionResolvable, ButtonInteraction } from 'discord.js'

export function createRow<Component extends AnyComponentBuilder = AnyComponentBuilder> (...components: Component[]): any {
  return new ActionRowBuilder<Component>({ components })
}

export class Discord {
  private readonly interaction?: CommandInteraction<CacheType> | MessageInteraction | ButtonInteraction<CacheType>
  public readonly guild?: Guild
  public readonly type?: string
  public readonly cause?: string
  public readonly color?: ColorResolvable
  public readonly infos?: any

  constructor (
    interaction: CommandInteraction<CacheType> | MessageInteraction | ButtonInteraction<CacheType>,
    guild: Guild,
    type: string,
    cause: string,
    color: ColorResolvable,
    infos: any
  ) {
    this.interaction = interaction
    this.guild = guild
    this.type = type
    this.cause = cause
    this.color = color
    this.infos = infos
  }

  /**
     * Registra um log de aviso no canal de logs do Discord.
     * @param message A mensagem do log.
     */
  public async sendLog (): Promise<void> {
    try {
      const { interaction, guild, type, cause, color, infos } = this

      let title = ''
      let name = ''
      let value = ''

      const logsDB = await db.guilds.get(`${guild?.id}.channel.logs`) as string
      const logsChannel = guild?.channels.cache.get(logsDB) as TextChannel

      switch (type) {
        case 'warn': {
          title = '⚠️ Aviso'
          break
        }
      }

      switch (cause) {
        case 'noPermission': {
          if (!(interaction instanceof ButtonInteraction)) {
            name = 'Usuário sem permissão tentou executar um comando'
            value = `<@${interaction?.user.id}> Tentou usar o comando` + '```' + `/${interaction?.commandName}` + '```'
          }
          break
        }
        case 'noPermissionBanKick': {
          const [{ userID, reason, actionType }] = infos
          name = 'Usuário sem permissão tentou executar um comando'
          value = `<@${interaction?.user.id}> Tentou ${actionType} o usuário <@${userID}>\nMotivo: ${reason}`
          break
        }
        case 'messageDelete': {
          name = 'Mensagem apagada era uma embed do sistema!'
          value = 'Alguém Apagou uma mensagem que em teoria não poderia!\nDeletando mensagem do Database...'
          break
        }
      }

      console.log(title, name, value)

      const embed = new EmbedBuilder()
        .setTitle(title)
        .addFields({
          name,
          value
        })
        .setColor(color ?? 'Random')

      if (logsChannel !== undefined) {
        await logsChannel.send({ embeds: [embed] })
      }
    } catch (err: any) {
      console.error(`Erro ao criar log de aviso: ${err}`)
    }
  }

  public static async logGenerator (
    interaction: CommandInteraction<CacheType> | MessageInteraction | ButtonInteraction<CacheType>,
    guild: Guild,
    type: string,
    cause: string,
    color: ColorResolvable,
    infos: any
  ): Promise<void> {
    const logsDiscord = new Discord(interaction, guild, type, cause, color, infos)
    await logsDiscord.sendLog()
  }

  public static async Permission (
    interaction: CommandInteraction<CacheType> | ButtonInteraction<CacheType>,
    typePermission: PermissionResolvable,
    typeLog?: string
  ): Promise<boolean> {
    try {
      const guild = interaction.guild as Guild
      if ((interaction?.memberPermissions?.has(typePermission)) === false) {
        await interaction.reply({
          content: '**❌ - Você não possui permissão para executar essa ação.**',
          ephemeral: true
        })
        await Discord.logGenerator(
          interaction,
          guild,
          'warn',
          typeLog ?? 'noPermission',
          'Orange',
          []
        )
        return true
      }
      return false
    } catch (err: any) {
      console.error(`Erro ao verificar permissão: ${err}`)
      return false
    }
  }
}
