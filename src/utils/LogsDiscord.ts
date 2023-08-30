import { type ColorResolvable, EmbedBuilder, type TextChannel } from 'discord.js'

export async function LogsDiscord (interaction: any, title: string, name: string, value: string, color: ColorResolvable): Promise<void> {
  const { guild } = interaction
  const logsChannel = guild?.channels.cache.find(
    (channel: { name: string }) => channel.name === 'logs'
  ) as TextChannel
  const embed = new EmbedBuilder()
    .setTitle(title)
    .addFields(
      {
        name,
        value
      }
    )
    .setColor(color)
  if (logsChannel !== undefined) {
    await logsChannel.send({ embeds: [embed] })
  }
}
