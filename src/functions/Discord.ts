import { core, db } from '@/app'
import { Component } from '@/discord/base'
import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, EmbedBuilder, ModalSubmitInteraction, StringSelectMenuInteraction, type User, codeBlock, type AnyComponentBuilder, type CacheType, type ChatInputCommandInteraction, type ColorResolvable, type CommandInteraction, type Guild, type MessageInteraction, type PermissionResolvable, type TextChannel, type Interaction } from 'discord.js'
import { genButtonID } from './UuidGen'

export function createRow<Component extends AnyComponentBuilder = AnyComponentBuilder> (...components: Component[]): ActionRowBuilder<Component> {
  return new ActionRowBuilder<Component>({ components })
}

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class Discord {
  /**
     * Registra um log de aviso no canal de logs do Discord.
     * @param message A mensagem do log.
     */
  public static async sendLog (options: {
    interaction: CommandInteraction<CacheType> | StringSelectMenuInteraction | ButtonInteraction | ModalSubmitInteraction | ChatInputCommandInteraction<CacheType> | MessageInteraction
    guild: Guild | null
    type: string
    cause: string
    color: ColorResolvable
    infos: any
  }): Promise<void> {
    try {
      const { interaction, guild, type, cause, color, infos } = options

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
          if (!(interaction instanceof ButtonInteraction) && !(interaction instanceof StringSelectMenuInteraction) && !(interaction instanceof ModalSubmitInteraction)) {
            name = 'Usuário sem permissão tentou executar um comando'
            value = `<@${interaction?.user.id}> Tentou usar o comando` + codeBlock(`/${interaction?.commandName}`)
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
        case 'noButtonPermission': {
          const [{ type, action }] = infos
          name = 'Usuário ``' + interaction.user.username + '``, tentou usar um botão que ele não tem permissão para interagir!'
          value = 'Tipo: ``' + type + '``, Botão: ``' + action + '``'
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

  public static async Permission (
    interaction: StringSelectMenuInteraction | ButtonInteraction | ModalSubmitInteraction | ChatInputCommandInteraction<CacheType>,
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
        await Discord.sendLog({
          interaction,
          guild,
          type: 'warn',
          cause: typeLog ?? 'noPermission',
          color: 'Orange',
          infos: []
        })
        return true
      }
      return false
    } catch (err: any) {
      console.error(`Erro ao verificar permissão: ${err}`)
      return true
    }
  }

  /**
   * Cria um botão de Redirecionamento
   */
  public static async buttonRedirect (options: {
    guildId: string | null
    channelId: string | undefined
    emoji?: string
    label: string
  }): Promise<ActionRowBuilder<ButtonBuilder>> {
    const { guildId, channelId, emoji, label } = options
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder({
        emoji,
        label,
        url: `https://discord.com/channels/${guildId}/${channelId}`,
        style: ButtonStyle.Link
      })
    )
  }

  /**
   * Calcula o tempo que demora para um component responder.
   */
  public static async registerComponent (options: {
    type: 'Button' | 'StringSelect' | 'RoleSelect' | 'ChannelSelect' | 'UserSelect' | 'MentionableSelect' | 'Modal'
    customId: string
    run: (interaction: any) => any
  }): Promise<Component> {
    const { customId, type, run: runCallback } = options
    return new Component({
      customId,
      type,
      async run (interaction: any) {
        const start = Date.now()
        await runCallback(interaction)
        const end = Date.now()
        const timeSpent = (end - start) / 1000 + 's'
        core.info(`${type} | ${interaction.customId} | ${timeSpent} | ${interaction.user.username}`)
      }
    })
  }
}

interface ButtonType {
  customId?: string
  emoji?: string
  style?: ButtonStyle
  url?: string
  label?: string
  disabled?: boolean
  isProtected?: { user: User }
  permission?: 'User' | 'Admin'
  type: 'Ticket' | 'Cart' | 'Product' | 'System' | 'Cupom' | 'SUEE' | 'Event'
}
export class CustomButtonBuilder extends ButtonBuilder implements ButtonType {
  customId
  url
  permission
  type
  isProtected
  constructor ({ customId, emoji, style, url, label, disabled, permission, type, isProtected }: ButtonType) {
    super()
    this.customId = customId
    if (emoji !== undefined) this.data.emoji = { name: emoji }
    this.data.style = style
    this.url = url
    this.data.label = label
    this.data.disabled = disabled ?? false
    this.type = type
    this.isProtected = isProtected
    this.permission = permission ?? 'User'
  }

  async init (): Promise<this> {
    const { Id } = await genButtonID({ isProtected: this.isProtected })
    if (this.customId !== undefined) { this.setCustomId(`${Id}_${this.permission}_${this.type}_${this.customId}`) }
    if (this.url !== undefined && this.customId === undefined) { this.setURL(this.url) }
    return this
  }

  static async create (buttonType: ButtonType): Promise<CustomButtonBuilder> {
    const builder = new CustomButtonBuilder(buttonType)
    return await builder.init()
  }

  static async verify (options: {
    id: string
    interaction: Interaction
  }): Promise<boolean> {
    const { id, interaction } = options
    const userDB = await db.tokens.get(id) as { user?: User | null }
    if (userDB?.user?.id === interaction.user.id || interaction.memberPermissions?.has('Administrator') === true) {
      return true
    }
    return false
  }

  static getInfos = (customId: string): string[] | null[] => {
    const parts = customId.split('_')
    if (parts.length === 4) {
      return [parts[0], parts[1], parts[2], parts[3]]
    }
    return [null, null, null, null]
  }

  static getAction (customId: string): string {
    const parts = customId.split('_')
    return parts[parts.length - 1]
  }
}
