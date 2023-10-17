import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  type CacheType, type CommandInteraction,
  type ButtonInteraction,
  type TextChannel
} from 'discord.js'
import { db } from '@/app'
import { brBuilder } from '@magicyan/discord'

export async function setSystem (interaction: CommandInteraction<CacheType> | ButtonInteraction<CacheType>): Promise<void> {
  const { guildId } = interaction
  const channelDB = (await db.guilds.get(`${guildId}.channel.system`)) as string
  const message1DB = (await db.messages.get(`${guildId}.system.message1`)) as string
  const message2DB = (await db.messages.get(`${guildId}.system.message2`)) as string
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

  const config = [
    new ButtonBuilder({
      customId: 'systemTicket',
      label: 'Ticket',
      emoji: { name: '🎫' }
    }),
    new ButtonBuilder({
      customId: 'systemWelcomer',
      label: 'Boas Vindas',
      emoji: { name: '❤️' }
    }),
    new ButtonBuilder({
      customId: 'systemLogs',
      label: 'Logs',
      emoji: { name: '📰' }
    }),
    new ButtonBuilder({
      customId: 'systemPayments',
      label: 'Pagamentos',
      emoji: { name: '💲' }
    })
  ]

  const config2 = [
    new ButtonBuilder({
      customId: 'systemDeleteServers',
      label: 'Delete Servers',
      emoji: { name: '🗑️' }
    })
  ]

  const presence = [
    new ButtonBuilder()
      .setCustomId('systemStatus')
      .setLabel('Status')
      .setEmoji({ name: '⚙️' }),
    new ButtonBuilder()
      .setCustomId('systemStatusMinecraft')
      .setLabel('Minecraft')
      .setEmoji({ name: '🧱' }),
    new ButtonBuilder()
      .setCustomId('systemStatusString')
      .setLabel('Mensagens')
      .setEmoji({ name: '📃' })
  ]
  const presence2 = [
    new ButtonBuilder()
      .setCustomId('systemStatusOnline')
      .setLabel('Online')
      .setEmoji({ name: '🟢' }),
    new ButtonBuilder()
      .setCustomId('systemStatusAusente')
      .setLabel('Ausente')
      .setEmoji({ name: '🟠' }),
    new ButtonBuilder()
      .setCustomId('systemStatusNoPerturbe')
      .setLabel('Não Perturbe')
      .setEmoji({ name: '🔴' }),
    new ButtonBuilder()
      .setCustomId('systemStatusInvisível')
      .setLabel('Invisível')
      .setEmoji({ name: '⚫' })
  ]

  const typeStatus: Record<string, string> = {
    systemStatusOnline: 'online',
    systemStatusAusente: 'idle',
    systemStatusNoPerturbe: 'dnd',
    systemStatusInvisível: 'invisible'
  }

  for (const value of config) {
    const { custom_id: customID } = Object(value.toJSON())
    const result = systemData?.[customID]
    if (result !== undefined && result === true) {
      value.setStyle(ButtonStyle.Success)
    } else if (result === false) {
      value.setStyle(ButtonStyle.Danger)
    } else {
      value.setStyle(ButtonStyle.Secondary)
    }
  }

  for (const value of config2) {
    const { custom_id: customID } = Object(value.toJSON())
    const result = systemData?.[customID]
    if (result !== undefined && result === true) {
      value.setStyle(ButtonStyle.Success)
    } else if (result === false) {
      value.setStyle(ButtonStyle.Danger)
    } else {
      value.setStyle(ButtonStyle.Secondary)
    }
  }

  for (const value of presence) {
    const { custom_id: customID } = Object(value.toJSON())
    const result = systemData?.[customID]
    if (result !== undefined && result === true) {
      value.setStyle(ButtonStyle.Success)
    } else if (result === false) {
      value.setStyle(ButtonStyle.Danger)
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
  const presenceRow1 = new ActionRowBuilder<ButtonBuilder>().addComponents(...presence)
  const presenceRow2 = new ActionRowBuilder<ButtonBuilder>().addComponents(...presence2)

  try {
    await channelSend?.messages.fetch(message1DB)
      .then(async (msg) => {
        await msg.edit({ embeds: [configEmbed], components: [configRow1, configRow2] })
      })
      .catch(async () => {
        await interaction.channel?.send({ embeds: [configEmbed], components: [configRow1, configRow2] })
          .then(async (msg) => {
            await db.messages.set(`${guildId}.system.message1`, msg.id)
            await interaction.editReply({ content: '✅ | Mensagem enviada com sucesso!' })
          })
      })
    await channelSend?.messages.fetch(message2DB)
      .then(async (msg) => {
        await msg.edit({ embeds: [presenceEmbed], components: [presenceRow1, presenceRow2] })
      })
      .catch(async () => {
        await interaction.channel?.send({ embeds: [presenceEmbed], components: [presenceRow1, presenceRow2] })
          .then(async (msg) => {
            await db.messages.set(`${guildId}.system.message2`, msg.id)
            await interaction.editReply({ content: '✅ | Mensagem enviada com sucesso!' })
          })
      })
  } catch (err) {
    console.log(err)
  }
}
