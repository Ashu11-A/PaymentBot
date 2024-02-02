import { type TextChannel, type CommandInteraction, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, type Message, codeBlock, type CacheType } from 'discord.js'
import { db } from '@/app'
import { UpdateProduct } from '@/discord/components/payments/product/functions/updateProduct'

export async function sendEmbed (interaction: CommandInteraction<CacheType>, channel: TextChannel): Promise<void> {
  const { guildId, channelId, guild } = interaction
  const icon = guild?.iconURL({ size: 2048 }) as string ?? undefined
  const embed = new EmbedBuilder({
    title: 'Plano',
    description: codeBlock('Sem nenhuma descrição'),
    thumbnail: { url: icon },
    image: { url: icon }
  }).setColor('Blue')
  const embedJson = embed.toJSON()

  await channel.send({ embeds: [embed.addFields({ name: '💵 | Preço:', value: 'R$0,00' })] })
    .then(async (message: Message<true>) => {
      const productBuilder = new UpdateProduct({ interaction, message })

      await db.messages.set(`${guildId}.payments.${channelId}.messages.${message.id}`,
        {
          id: message.id,
          embed: embedJson
        })
      await productBuilder.buttonsConfig({})
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
