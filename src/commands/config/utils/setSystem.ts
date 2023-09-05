import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, type CacheType, type CommandInteraction, type ButtonInteraction, type TextChannel } from 'discord.js'
import { db } from '@/app'
export async function setSystem (interaction: CommandInteraction<CacheType> | ButtonInteraction<CacheType>): Promise<void> {
  const guildID = interaction?.guild?.id
  const channelDB = await db.guilds.get(`${guildID}.channel.system`) as string
  const messageDB = await db.messages.get(`${guildID}.system`) as string

  let channelSend

  if (channelDB !== undefined) {
    channelSend = interaction.guild?.channels.cache.get(String(channelDB)) as TextChannel
  }
  const embed = new EmbedBuilder()
    .setTitle('🎉 Configurações')
    .setDescription('Escolha quais sistemas do bot você deseja ativar ou desativar neste servidor.')
    .setColor('Green')

  const row1Buttons = [
    new ButtonBuilder()
      .setCustomId('systemTicket')
      .setLabel('Ticket')
      .setEmoji({ name: '🎫' }),
    new ButtonBuilder()
      .setCustomId('systemWelcomer')
      .setLabel('Bem vindo')
      .setEmoji({ name: '❤️' })
  ]
  const row2Buttons = [
    new ButtonBuilder()
      .setCustomId('systemStatus')
      .setLabel('Status')
      .setEmoji({ name: '⚙️' }),
    new ButtonBuilder()
      .setCustomId('systemLogs')
      .setLabel('Logs')
      .setEmoji({ name: '📰' })
  ]

  const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(...row1Buttons)
  const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(row2Buttons)

  const emojiToButtonType: any = {
    '🎫': 'systemTicket',
    '❤️': 'systemWelcomer',
    '⚙️': 'systemStatus',
    '📰': 'systemLogs'
  }

  for (const value of row1Buttons.concat(row2Buttons)) {
    const buttons = value.data.emoji?.name as string
    const result = await db.system.get(`${interaction?.guild?.id}.status.${emojiToButtonType[buttons]}`)
    if (result !== undefined && result === true) {
      value.setStyle(ButtonStyle.Success)
    } else if (result === false) {
      value.setStyle(ButtonStyle.Danger)
    } else {
      value.setStyle(ButtonStyle.Secondary)
    }
  }
  try {
    if (channelSend !== undefined) {
      await channelSend.messages.fetch(messageDB)
        .then(async (msg) => {
          await msg.edit({ embeds: [embed], components: [row1, row2] })
        })
        .catch(async () => {
          await interaction.channel?.send({ embeds: [embed], components: [row1, row2] })
            .then(async (msg) => {
              await db.messages.set(`${guildID}.system`, msg.id)
              await interaction.editReply({ content: '✅ | Mensagem enviada com sucesso!' })
            })
        })
    } else {
      await interaction.channel?.send({ embeds: [embed], components: [row1, row2] })
        .then(async (msg) => {
          await db.messages.set(`${guildID}.system`, msg.id)
        })
    }
  } catch (err) {
    console.log(err)
  }
}
