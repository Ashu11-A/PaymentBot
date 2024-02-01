import { db } from '@/app'
import { CustomButtonBuilder } from '@/functions'
import { type ModalSubmitInteraction, type CacheType, type ButtonInteraction, type CommandInteraction, type StringSelectMenuInteraction, type ChatInputCommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, type Message } from 'discord.js'

interface GenAccountType {
  interaction: ModalSubmitInteraction<CacheType> | ButtonInteraction<CacheType> | CommandInteraction<CacheType> | StringSelectMenuInteraction<CacheType> | ChatInputCommandInteraction<CacheType>
}

export class GenAccount {
  interaction
  constructor ({ interaction }: GenAccountType) {
    this.interaction = interaction
  }

  public async getData (): Promise<{
    urlPtero: string | undefined
    tokenPtero: string | undefined
    urlCtrl: string | undefined
    tokenCtrl: string | undefined
    pteroUserDB: any
    ctrlUserDB: any
  }> {
    const { guildId, user } = this.interaction
    const { url: urlPtero, tokenPanel: tokenPtero } = (await db.payments.get(
        `${guildId}.config.pterodactyl`
    )) as { url?: string, tokenPanel?: string }
    const { url: urlCtrl, token: tokenCtrl } = (await db.payments.get(
        `${guildId}.config.ctrlPanel`
    )) as { url?: string, token?: string }

    const pteroUserDB = (await db.pterodactyl.table('guilds').get(`${guildId}.users.${user.id}`)) ?? undefined
    const ctrlUserDB = (await db.ctrlPanel.table('guilds').get(`${guildId}.users.${user.id}`)) ?? undefined

    console.log(pteroUserDB)
    console.log(ctrlUserDB)

    return { urlPtero, tokenPtero, urlCtrl, tokenCtrl, pteroUserDB, ctrlUserDB }
  }

  /**
    * name
    */
  public async genRegister (): Promise<Message<boolean> | undefined> {
    const { interaction } = this
    const { urlCtrl, urlPtero, tokenCtrl, tokenPtero, ctrlUserDB, pteroUserDB } = await this.getData()

    const embed = new EmbedBuilder({
      title: `👋 Olá ${interaction.user.username}, bem vindo ao nosso sistema de registro.`,
      description:
                'Abaixo se encontra os metodos atuais para realizar o registro'
    }).setColor('Blurple')

    const row = new ActionRowBuilder<ButtonBuilder>()
    const row2 = new ActionRowBuilder<ButtonBuilder>()

    if (urlCtrl !== undefined && tokenCtrl !== undefined) {
      row.addComponents(
        await CustomButtonBuilder.create({
          permission: 'User',
          type: 'Account',
          label: 'CtrlPanel',
          customId: 'CtrlPanel',
          style: ctrlUserDB !== undefined ? ButtonStyle.Success : ButtonStyle.Secondary,
          emoji: { name: '🖥️' },
          isProtected: { user: interaction.user }
        })
      )
      row2.addComponents(
        new ButtonBuilder({
          url: urlCtrl,
          emoji: { name: '🔗' },
          label: 'Ctrl',
          style: ButtonStyle.Link,
          type: ComponentType.Button
        })
      )
    }

    if (urlPtero !== undefined && tokenPtero !== undefined) {
      row.addComponents(
        await CustomButtonBuilder.create({
          permission: 'User',
          type: 'Account',
          label: 'Pterodactyl',
          customId: 'Pterodactyl',
          style: pteroUserDB !== undefined ? ButtonStyle.Success : ButtonStyle.Secondary,
          emoji: { name: '🦖' },
          isProtected: { user: interaction.user },
          disabled: true
        })
      )
      row2.addComponents(
        new ButtonBuilder({
          url: urlPtero,
          emoji: { name: '🔗' },
          label: 'Ptero',
          style: ButtonStyle.Link,
          type: ComponentType.Button
        })
      )
    }

    if (row.components.length !== 0) {
      return await interaction.editReply({
        embeds: [embed],
        components: [row, row2]
      })
    } else {
      await interaction.editReply({
        embeds: [
          new EmbedBuilder({
            title: '❌ | Nenhum metodo de registro está configurado!'
          }).setColor('Red')
        ]
      })
    }
  }

  /**
   * genLogin
   */
  public async genLogin (): Promise<Message<boolean> | undefined> {
    const { interaction } = this
    const { urlCtrl, urlPtero, tokenCtrl, tokenPtero, ctrlUserDB, pteroUserDB } = await this.getData()

    const embed = new EmbedBuilder({
      title: `👋 Bem vindo ${interaction.user.username}.`,
      description:
                'Abaixo se encontra os metodos atuais para realizar o Login em nossas plataformas'
    }).setColor('Blurple')

    const row = new ActionRowBuilder<ButtonBuilder>()
    const row2 = new ActionRowBuilder<ButtonBuilder>()

    if (urlCtrl !== undefined && tokenCtrl !== undefined) {
      row.addComponents(
        await CustomButtonBuilder.create({
          permission: 'User',
          type: 'Cart',
          label: 'CtrlPanel',
          customId: 'Direct',
          style: ctrlUserDB !== undefined ? ButtonStyle.Success : ButtonStyle.Secondary,
          emoji: { name: '🖥️' },
          isProtected: { user: interaction.user }
        })
      )
      row2.addComponents(
        new ButtonBuilder({
          url: urlCtrl,
          emoji: { name: '🔗' },
          label: 'Ctrl',
          style: ButtonStyle.Link,
          type: ComponentType.Button
        })
      )
    }

    if (urlPtero !== undefined && tokenPtero !== undefined) {
      row.addComponents(
        await CustomButtonBuilder.create({
          permission: 'User',
          type: 'Account',
          label: 'Pterodactyl',
          customId: 'Pterodactyl',
          style: pteroUserDB !== undefined ? ButtonStyle.Success : ButtonStyle.Secondary,
          emoji: { name: '🦖' },
          isProtected: { user: interaction.user },
          disabled: true
        })
      )
      row2.addComponents(
        new ButtonBuilder({
          url: urlPtero,
          emoji: { name: '🔗' },
          label: 'Ptero',
          style: ButtonStyle.Link,
          type: ComponentType.Button
        })
      )
    }

    if (row.components.length !== 0) {
      return await interaction.editReply({
        embeds: [embed],
        components: [row, row2]
      })
    } else {
      await interaction.editReply({
        embeds: [
          new EmbedBuilder({
            title: '❌ | Nenhum metodo de registro está configurado!'
          }).setColor('Red')
        ]
      })
    }
  }
}
