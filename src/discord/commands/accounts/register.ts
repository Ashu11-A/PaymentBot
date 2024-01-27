import { db } from '@/app'
import { Command } from '@/discord/base'
import { CustomButtonBuilder } from '@/functions'
import {
  ActionRowBuilder,
  ApplicationCommandType,
  type ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} from 'discord.js'

new Command({
  name: 'registro',
  nameLocalizations: {
    'en-US': 'register'
  },
  description: '[ 🧑 Perfil] Registro',
  descriptionLocalizations: {
    'en-GB': '[ 🧑 Perfil] Register'
  },
  dmPermission,
  type: ApplicationCommandType.ChatInput,
  async run (interaction) {
    if (!interaction.inCachedGuild()) return
    await interaction.deferReply({ ephemeral })

    const { guildId, user } = interaction
    const { url: urlPtero, tokenPanel: tokenPtero } = (await db.payments.get(
      `${guildId}.config.pterodactyl`
    )) ?? { url: undefined, tokenPanel: undefined }

    const { url: urlCtrl, token: tokenCtrl } = (await db.payments.get(
      `${guildId}.config.ctrlPanel`
    )) ?? { url: undefined, token: undefined }

    const embed = new EmbedBuilder({
      title: `👋 Olá ${user.username}, bem vindo ao nosso sistema de registro.`,
      description:
        'Abaixo se encontra os metodos atuais para realizar o registro'
    }).setColor('Blurple')

    const row = new ActionRowBuilder<ButtonBuilder>()

    if (urlCtrl !== undefined && tokenCtrl !== undefined) {
      row.addComponents(
        await CustomButtonBuilder.create({
          permission: 'User',
          type: 'Account',
          label: 'CtrlPanel',
          customId: 'CtrlPanel',
          style: ButtonStyle.Secondary,
          emoji: { name: '🖥️' },
          isProtected: { user }
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
          style: ButtonStyle.Secondary,
          emoji: { name: '🦖' },
          isProtected: { user }
        })
      )
    }

    if (row.components.length !== 0) {
      return await interaction.editReply({
        embeds: [embed],
        components: [row]
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
})
