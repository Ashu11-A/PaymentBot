import { type TextChannel, type CommandInteraction, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, type Message } from 'discord.js'

import { db } from '@/app'
import { updateProduct } from './updateProduct'

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
    .then(async (message: Message<true>) => {
      await db.messages.set(`${guildId}.payments.${channelId}.messages.${message.id}`,
        {
          id: message.id,
          embed: embed.toJSON()
        })
      await updateProduct.buttonsConfig({
        interaction,
        message
      })
      await interaction.editReply({
        content: '✅ | Item criado com sucesso!',
        components: [
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
              .setLabel('Clique para ir a mensagem')
              .setURL(message.url)
              .setStyle(ButtonStyle.Link)
          )
        ]
      })
    })
}
