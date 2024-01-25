import { db } from '@/app'
import { Discord, genv4 } from '@/functions'
import { ChannelType, EmbedBuilder, PermissionsBitField, type ButtonInteraction, type CacheType, type Collection, type OverwriteResolvable, TextChannel } from 'discord.js'
import { type cartData, type productData } from './interfaces'
import { UpdateCart } from './UpdateCart'

export async function createCart (interaction: ButtonInteraction<CacheType>): Promise<void> {
  if (!interaction.inGuild() || !interaction.inCachedGuild()) return
  const { channelId, guild, guildId, user, message } = interaction
  const name = `🛒-${user.id}`
  const sendChannel = guild.channels.cache.find((c) => c.name === name)
  const productData = await db.messages.get(`${guildId}.payments.${channelId}.messages.${message.id}`) as productData
  const product = productData?.embed?.title
  const status = await db.system.get(`${guildId}.status`)
  const paymentsConfig = await db.payments.get(`${guildId}.config`)

  // Verificar se o produto está configurado
  if (productData?.properties?.SetCtrlPanel === undefined && productData?.coins === undefined) {
    await interaction.editReply({
      embeds: [
        new EmbedBuilder({
          title: 'Nenhum método de envio foi configurado.'
        }).setColor('Aqua')
      ]
    })
    return
  }

  const { coins, price, role, id } = productData

  if (price === undefined) {
    await interaction.editReply({ content: '🤔 | Desculpe... mas esse produto não tem um valor.' })
    return
  }
  if (status?.Payments !== undefined && status.Payments === false) {
    await interaction.editReply({ content: '❌ | O sistema de pagamentos está desabilitado no momento!' })
    return
  }

  if (sendChannel !== undefined && sendChannel instanceof TextChannel) {
    try {
      const cartData = await db.payments.get(`${guildId}.process.${sendChannel.id}`) as cartData
      if (cartData.products.some((product) => product.id === message.id)) {
        await interaction.editReply({
          embeds: [new EmbedBuilder({
            title: '🤚 Desculpe, mas esse item já está no seu carrinho!'
          }).setColor('Red')]
        })
        return
      }
      await db.payments.push(`${guildId}.process.${sendChannel.id}.products`, {
        id,
        name: product,
        amount: price,
        quantity: 1,
        coins
      })
      const cartBuilder = new UpdateCart({ interaction, cartData: await db.payments.get(`${guildId}.process.${sendChannel.id}`) as cartData })
      await cartBuilder.embedAndButtons({
        channel: sendChannel,
        message
      })
      await interaction.editReply({
        embeds: [
          new EmbedBuilder({
            title: `📦 | Produto: ${product} adicionado ao carrinho com sucesso!`
          })
            .setColor('Green')
        ],
        components: [
          await Discord.buttonRedirect({
            guildId,
            channelId: sendChannel.id,
            emoji: '🛒',
            label: 'Ir ao carrinho'
          })
        ]
      })
    } catch {
      await interaction.editReply({
        embeds: [new EmbedBuilder({
          title: '❌ | Ocorreu um erro ao abrir o carrinho!'
        }).setColor('Red')]
      })
    }
  } else {
    try {
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

      /* Cria o chat de Pagamento */
      const category = guild.channels.cache.find(category => category.type === ChannelType.GuildCategory && category.id === paymentsConfig?.category)
      const paymentChannel = await guild.channels.create({
        name,
        type: ChannelType.GuildText,
        topic: `Carrinho do(a) ${user.username}, ID: ${user.id}`,
        permissionOverwrites,
        parent: category?.id
      })

      const data: any = await db.payments.set(`${guildId}.process.${paymentChannel.id}`, {
        UUID: genv4(),
        userID: user.id,
        channelId: paymentChannel.id,
        role,
        typeEmbed: 0,
        products: [
          {
            id,
            name: product,
            amount: price,
            quantity: 1,
            coins
          }
        ]
      })

      const cartBuilder = new UpdateCart({ interaction, cartData: data.process[paymentChannel.id] })
      const { main: { embeds } } = await cartBuilder.embedAndButtons({ channel: paymentChannel })

      if (paymentChannel !== undefined && embeds !== undefined) {
        await interaction.editReply({
          embeds: [
            new EmbedBuilder({
              title: `👋Olá ${user.username}`,
              description: '✅ | Seu carrinho foi aberto com sucesso!'
            })
              .setColor('Green')
          ],
          components: [
            await Discord.buttonRedirect({
              guildId,
              channelId: paymentChannel.id,
              emoji: '🛒',
              label: 'Ir ao carrinho'
            })
          ]
        })
      } else {
        await interaction.editReply({ content: '❌ | Ocorreu um erro!' })
        await paymentChannel?.delete()
        await db.payments.delete(`${guildId}.process.${paymentChannel.id}`)
      }
    } catch (err) {
      console.log(err)
    }
  }
}
