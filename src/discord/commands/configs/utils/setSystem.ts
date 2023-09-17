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
  const guildID = interaction?.guild?.id
  const channelDB = (await db.guilds.get(`${guildID}.channel.system`)) as string
  const message1DB = (await db.messages.get(`${guildID}.system.message1`)) as string
  const message2DB = (await db.messages.get(`${guildID}.system.message2`)) as string

  let channelSend

  if (channelDB !== undefined) {
    channelSend = interaction.guild?.channels.cache.get(String(channelDB)) as TextChannel
  }

  const enabled = new EmbedBuilder()
    .setTitle('🎉 Configurações')
    .setDescription(brBuilder(
      '◈ Escolha quais sistemas do bot você deseja ativar ou desativar neste servidor.',
      '◈ Para configurar os tickets, utilize </config ticket:1150898069941002267>,',
      'os Logs, Boas Vindas, e outos aspectos, utilize </config guild:1150898069941002267>',
      'configure o sistema de pagamentos em: </config pagamentos:1150898069941002267>.'
    ))

  const statusEmbed = new EmbedBuilder({
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

  const row1Buttons = [
    new ButtonBuilder()
      .setCustomId('systemTicket')
      .setLabel('Ticket')
      .setEmoji({ name: '🎫' }),
    new ButtonBuilder()
      .setCustomId('systemWelcomer')
      .setLabel('Boas Vindas')
      .setEmoji({ name: '❤️' }),
    new ButtonBuilder()
      .setCustomId('systemLogs')
      .setLabel('Logs')
      .setEmoji({ name: '📰' }),
    new ButtonBuilder()
      .setCustomId('systemPayments')
      .setLabel('Pagamentos')
      .setEmoji({ name: '💲' })
  ]

  const row2Buttons = [
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
  const row3Buttons = [
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

  const typeStatus: any = {
    systemStatusOnline: 'online',
    systemStatusAusente: 'idle',
    systemStatusNoPerturbe: 'dnd',
    systemStatusInvisível: 'invisible'
  }

  const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(...row1Buttons)
  const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(...row2Buttons)
  const row3 = new ActionRowBuilder<ButtonBuilder>().addComponents(...row3Buttons)

  for (const value of row1Buttons) {
    const { custom_id: customID } = Object(value.toJSON())
    const result = await db.system.get(`${interaction?.guild?.id}.status.${customID}`)
    if (result !== undefined && result === true) {
      value.setStyle(ButtonStyle.Success)
    } else if (result === false) {
      value.setStyle(ButtonStyle.Danger)
    } else {
      value.setStyle(ButtonStyle.Secondary)
    }
  }

  for (const value of row2Buttons) {
    const { custom_id: customID } = Object(value.toJSON())
    const result = await db.system.get(`${interaction?.guild?.id}.status.${customID}`)
    if (result !== undefined && result === true) {
      value.setStyle(ButtonStyle.Success)
    } else if (result === false) {
      value.setStyle(ButtonStyle.Danger)
    } else {
      value.setStyle(ButtonStyle.Secondary)
    }
  }

  for (const value of row3Buttons) {
    const { custom_id: customID } = Object(value.toJSON())
    const result = await typeStatus[customID]
    const systemEnabled = await db.system.get(`${interaction?.guild?.id}.status.systemStatusType`)
    if (systemEnabled === result) {
      value.setStyle(ButtonStyle.Success)
    } else {
      value.setStyle(ButtonStyle.Secondary)
    }
  }

  try {
    await channelSend?.messages.fetch(message1DB)
      .then(async (msg) => {
        await msg.edit({ embeds: [enabled], components: [row1] })
      })
      .catch(async () => {
        await interaction.channel?.send({ embeds: [enabled], components: [row1] })
          .then(async (msg) => {
            await db.messages.set(`${guildID}.system.message1`, msg.id)
            await interaction.editReply({ content: '✅ | Mensagem enviada com sucesso!' })
          })
      })
    await channelSend?.messages.fetch(message2DB)
      .then(async (msg) => {
        await msg.edit({ embeds: [statusEmbed], components: [row2, row3] })
      })
      .catch(async () => {
        await interaction.channel?.send({ embeds: [statusEmbed], components: [row2, row3] })
          .then(async (msg) => {
            await db.messages.set(`${guildID}.system.message2`, msg.id)
            await interaction.editReply({ content: '✅ | Mensagem enviada com sucesso!' })
          })
      })
  } catch (err) {
    console.log(err)
  }
}
