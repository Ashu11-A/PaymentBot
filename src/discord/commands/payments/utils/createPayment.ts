import { db } from '@/app'
import { type ButtonInteraction, type CacheType, ButtonBuilder, ActionRowBuilder, ButtonStyle, EmbedBuilder, PermissionsBitField, ChannelType, type OverwriteResolvable, type Collection } from 'discord.js'
import { paymentEmbed } from './paymentEmbed'

export async function createPayment (interaction: ButtonInteraction<CacheType>): Promise<void> {
  await interaction.deferReply({ ephemeral })
  const { channelId, guild, guildId, user, message } = interaction
  const name = `🛒-${user.id}`
  const sendChannel = guild?.channels.cache.find((c) => c.name === name)

  if (sendChannel !== undefined) {
    await interaction.editReply({
      embeds: [
        new EmbedBuilder({
          title: `👋 Olá ${user.username}`,
          description: '☺️ | Você já tem um carrinho aberto!'
        })
          .setColor('Red')
      ],
      components: [
        await buttonRedirect(guildId as string, sendChannel.id)
      ]
    })
  } else {
    try {
      const { embed } = await db.messages.get(`${guildId}.payments.${channelId}.messages.${message.id}`)
      const enabled = await db.system.get(`${guildId}.status.systemPayments`)
      if (enabled !== undefined && enabled === false) {
        await interaction.editReply({ content: '❌ | O sistema de pagamentos está desabilitado no momento!' })
        return
      }

      // Permissões de visualização do novo channel
      const permissionOverwrites = [
        {
          id: guildId,
          deny: [PermissionsBitField.Flags.ViewChannel]
        },
        {
          id: user.id,
          allow: [PermissionsBitField.Flags.ViewChannel]
        }
      ] as OverwriteResolvable[] | Collection<string, OverwriteResolvable>

      // Cria o chat de Pagamento
      const paymentChannel = await guild?.channels.create({
        name,
        type: ChannelType.GuildText,
        topic: `Carrinho do(a) ${user.username}, ID: ${user.id}`,
        permissionOverwrites,
        parent: await db.guilds.get(`${guild?.id}.payments.category`)
      })

      const { rEmbeds, rComponents } = await paymentEmbed.TypeRedeem({
        interaction,
        data: embed,
        typeEmbed: 1
      })
      const embeds = rEmbeds.map((embedBuilder) =>
        embedBuilder.toJSON()
      )
      const components = rComponents.map((componentsBuilder) =>
        componentsBuilder.toJSON()
      )

      if (paymentChannel !== undefined) {
        await paymentChannel.send({
          embeds,
          components
        })
          .then(async () => {
            await interaction.editReply({
              embeds: [
                new EmbedBuilder({
                  title: `👋Olá ${user.username}`,
                  description: '✅ | Seu carrinho foi aberto com sucesso!'
                })
                  .setColor('Green')
              ],
              components: [
                await buttonRedirect(guildId as string, paymentChannel.id)
              ]
            })
          })
          .catch(async (err) => {
            console.log(err)
            await paymentChannel.delete()
            await interaction.editReply({
              content: '❌ | Ocorreu um erro!'
            })
          })
      } else {
        await interaction.editReply({
          content: '❌ | Ocorreu um erro!'
        })
      }
    } catch (err) {
      console.log(err)
    }
  }
}

async function buttonRedirect (guildId: string, channelId: string): Promise<ActionRowBuilder<ButtonBuilder>> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder({
      emoji: '🛒',
      label: 'Ir ao carrinho',
      url: `https://discord.com/channels/${guildId}/${channelId}`,
      style: ButtonStyle.Link
    })
  )
}
