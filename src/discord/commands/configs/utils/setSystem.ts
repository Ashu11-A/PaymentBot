import { db } from '@/app'
import { CustomButtonBuilder } from '@/functions'
import { brBuilder } from '@magicyan/discord'
import {
  ActionRowBuilder,
  type ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  type ButtonInteraction,
  type CacheType, type CommandInteraction,
  type TextChannel
} from 'discord.js'

export async function setSystem (interaction: CommandInteraction<CacheType> | ButtonInteraction<CacheType>): Promise<void> {
  const { guildId } = interaction
  const channelDB = (await db.guilds.get(`${guildId}.channel.system`)) as string
  const systemData = await db.system.get(`${guildId}.status`)

  let channelSend

  if (channelDB !== undefined) {
    channelSend = interaction.guild?.channels.cache.get(String(channelDB)) as TextChannel
  }

  const configEmbed = new EmbedBuilder({
    title: '🎉 Configurações',
    description: brBuilder(
      '◈ Escolha quais sistemas do bot você deseja ativar ou desativar neste servidor.',
      '◈ Para configurar os tickets, utilize </config ticket:1150898069941002267>,',
      'os Logs, Boas Vindas, e outos aspectos, utilize </config guild:1150898069941002267>',
      'configure o sistema de pagamentos em: </config pagamentos:1150898069941002267>.'
    ),
    color: 0x57f287
  })

  const presenceEmbed = new EmbedBuilder({
    title: '⚙️ Presence Status',
    description: brBuilder(
      '◈ Ative ou Desative o status do Bot.',
      '◈ Escolha abaixo qual tipo de status deseja.',
      '◈ Os status são atualizados a cada ``15 segundos``.',
      '◈ Mensagens: Você pode personalizar os status com o comando </config status opções:1150898069941002267>.',
      '◈ Minecraft: Para utilizar esse metodo configure-o em: </config status minecraft:1150898069941002267>.'
    ),
    color: 0x57f287
  })

  const telegramEmbed = new EmbedBuilder({
    title: '✈️ Telegram Config',
    description: brBuilder(
      'Notificações: Envia as mensagens de um channel selecionado para o Telegram.'
    ),
    color: 0x57f287
  })

  const config = [
    await CustomButtonBuilder.create({
      permission: 'Admin',
      type: 'System',
      label: 'Ticket',
      customId: 'Ticket',
      emoji: '🎫'
    }),
    await CustomButtonBuilder.create({
      permission: 'Admin',
      type: 'System',
      customId: 'Welcomer',
      label: 'Boas Vindas',
      emoji: '❤️'
    }),
    await CustomButtonBuilder.create({
      permission: 'Admin',
      type: 'System',
      customId: 'Logs',
      label: 'Logs',
      emoji: '📰'
    }),
    await CustomButtonBuilder.create({
      permission: 'Admin',
      type: 'System',
      customId: 'Payments',
      label: 'Pagamentos',
      emoji: '💲'
    })
  ]

  const config2 = [
    await CustomButtonBuilder.create({
      permission: 'Admin',
      type: 'System',
      customId: 'DeleteServers',
      label: 'Delete Servers',
      emoji: '🗑️'
    })
  ]

  const configTelegram = [
    await CustomButtonBuilder.create({
      permission: 'Admin',
      type: 'System',
      customId: 'TelegramNotif',
      label: 'Notificações',
      emoji: '📤'
    })
  ]

  const presence = [
    await CustomButtonBuilder.create({
      permission: 'Admin',
      type: 'System',
      customId: 'Status',
      label: 'Status',
      emoji: '⚙️'
    }),
    await CustomButtonBuilder.create({
      permission: 'Admin',
      type: 'System',
      customId: 'StatusMinecraft',
      label: 'Minecraft',
      emoji: '🧱'
    }),
    await CustomButtonBuilder.create({
      permission: 'Admin',
      type: 'System',
      customId: 'StatusString',
      label: 'Mensagens',
      emoji: '📃'
    })
  ]
  const presence2 = [
    await CustomButtonBuilder.create({
      permission: 'Admin',
      type: 'System',
      customId: 'StatusOnline',
      label: 'Online',
      emoji: '🟢'
    }),
    await CustomButtonBuilder.create({
      permission: 'Admin',
      type: 'System',
      customId: 'StatusAusente',
      label: 'Ausente',
      emoji: '🟠'
    }),
    await CustomButtonBuilder.create({
      permission: 'Admin',
      type: 'System',
      customId: 'StatusNoPerturbe',
      label: 'Não Perturbe',
      emoji: '🔴'
    }),
    await CustomButtonBuilder.create({
      permission: 'Admin',
      type: 'System',
      customId: 'StatusInvisível',
      label: 'Invisível',
      emoji: '⚫'
    })
  ]

  const typeStatus: Record<string, string> = {
    StatusOnline: 'online',
    StatusAusente: 'idle',
    StatusNoPerturbe: 'dnd',
    StatusInvisível: 'invisible'
  }

  for (const value of config) {
    const { custom_id: customID } = Object(value.toJSON())
    const result = systemData?.[customID]
    if (result !== undefined && result === true) {
      value.setStyle(ButtonStyle.Success)
    } else {
      value.setStyle(ButtonStyle.Secondary)
    }
  }

  for (const value of config2) {
    const { custom_id: customID } = Object(value.toJSON())
    const result = systemData?.[customID]
    if (result !== undefined && result === true) {
      value.setStyle(ButtonStyle.Success)
    } else {
      value.setStyle(ButtonStyle.Secondary)
    }
  }

  for (const value of configTelegram) {
    const { custom_id: customID } = Object(value.toJSON())
    const result = systemData?.[customID]
    if (result !== undefined && result === true) {
      value.setStyle(ButtonStyle.Success)
    } else {
      value.setStyle(ButtonStyle.Secondary)
    }
  }

  for (const value of presence) {
    const { custom_id: customID } = Object(value.toJSON())
    const result = systemData?.[customID]
    if (result !== undefined && result === true) {
      value.setStyle(ButtonStyle.Success)
    } else {
      value.setStyle(ButtonStyle.Secondary)
    }
  }

  for (const value of presence2) {
    const { custom_id: customID } = Object(value.toJSON())
    const result = typeStatus[customID]
    const systemEnabled = systemData?.status?.systemStatusType
    if (systemEnabled === result) {
      value.setStyle(ButtonStyle.Success)
    } else {
      value.setStyle(ButtonStyle.Secondary)
    }
  }

  const configRow1 = new ActionRowBuilder<ButtonBuilder>().addComponents(...config)
  const configRow2 = new ActionRowBuilder<ButtonBuilder>().addComponents(...config2)
  const telegramRow1 = new ActionRowBuilder<ButtonBuilder>().addComponents(...configTelegram)
  const presenceRow1 = new ActionRowBuilder<ButtonBuilder>().addComponents(...presence)
  const presenceRow2 = new ActionRowBuilder<ButtonBuilder>().addComponents(...presence2)

  const embedsData = [
    {
      embed: configEmbed,
      row: [configRow1, configRow2]
    },
    {
      embed: telegramEmbed,
      row: [telegramRow1]
    },
    {
      embed: presenceEmbed,
      row: [presenceRow1, presenceRow2]
    }
  ]

  try {
    for (let index = 1; index <= embedsData.length; index++) {
      const { embed, row } = embedsData[index - 1]
      const dbKey = `${guildId}.system.message${index}`
      const messageId = await db.messages.get(dbKey)

      await channelSend?.messages.fetch(messageId)
        .then(async (msg) => {
          await msg.edit({ embeds: [embed], components: row })
        })
        .catch(async () => {
          await interaction.channel?.send({ embeds: [embed], components: row })
            .then(async (msg) => {
              await db.messages.set(dbKey, msg.id)
              await interaction.editReply({ content: '✅ | Mensagem enviada com sucesso!' })
            })
        })
    }
  } catch (error) {
    console.error(error)
  }
}
