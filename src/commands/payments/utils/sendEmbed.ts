import { type TextChannel, type CommandInteraction, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, type Message } from 'discord.js'

import { db } from '@/app'
import { buttonsConfig } from './buttons'

export default async function sendEmbed (interaction: CommandInteraction<'cached'>, channel: TextChannel): Promise<void> {
  const { guildId, channelId } = interaction
  const embed = new EmbedBuilder()
    .setTitle('Plano')
    .setDescription('```' + 'Sem nenhuma descrição' + '```')
    .addFields(
      { name: '💵 | Preço:', value: '0' }
    )
    .setThumbnail(interaction.guild.iconURL({ size: 512 }))
    .setImage(interaction.guild.iconURL({ size: 2048 }))
    .setColor('Blue')

  await channel.send({ embeds: [embed] })
    .then(async (msg: Message<true>) => {
      await db.payments.set(`${guildId}.channels.${channelId}.messages.${msg.id}`,
        {
          id: msg.id,
          embed: embed.toJSON()
        })
      await buttonsConfig(interaction, msg)
      await interaction.editReply({
        content: '✅ | Item criado com sucesso!',
        components: [
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
              .setLabel('Clique para ir a mensagem')
              .setURL(msg.url)
              .setStyle(ButtonStyle.Link)
          )
        ]
      })
    })
}
