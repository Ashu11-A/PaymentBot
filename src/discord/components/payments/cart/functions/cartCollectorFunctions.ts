import { core, db } from '@/app'
import { UpdateCart } from '@/discord/components/payments'
import { type cartData } from '@/interfaces'
import { ctrlPanel } from '@/functions/ctrlPanel'
import { settings } from '@/settings'
import { createRow } from '@magicyan/discord'
import axios from 'axios'
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder, codeBlock, type ButtonInteraction, type CacheType, TextChannel, Message, type ModalSubmitInteraction } from 'discord.js'

export class PaymentFunction {
  private readonly interaction
  private readonly key

  constructor ({ interaction, key }: {
    interaction: ButtonInteraction<CacheType> | ModalSubmitInteraction<CacheType>
    key?: string
  }) {
    this.interaction = interaction
    this.key = key
  }

  /**
     * Selecionar metodo de resgate.
     */
  public async DM (): Promise<void> {
    const { interaction, key } = this
    const { guildId, message, channelId } = interaction
    await db.payments.set(`${guildId}.process.${channelId}.typeRedeem`, 1)
    await db.payments.set(`${guildId}.process.${channelId}.properties.${key}`, true)
    await db.payments.delete(`${guildId}.process.${channelId}.properties.Direct`)
    await db.payments.delete(`${guildId}.process.${channelId}.user`)
    await this.NextOrBefore({ type: 'next' })

    const data = await db.payments.get(`${guildId}.process.${channelId}`)
    const cartBuilder = new UpdateCart({ interaction, cartData: data })
    await cartBuilder.embedAndButtons({ message })
    await interaction.deleteReply()
    /* Modo debug
    await UpdateCart.displayData({
      interaction,
      data,
      type: 'editReply'
    })
    */
  }

  /**
   * Cancelar Pedido (Deleta database e chat)
   */
  public async Cancelar (): Promise<void> {
    const { interaction } = this
    if (!interaction.isButton()) return
    const { message, guildId, channelId } = interaction

    const embed = new EmbedBuilder()
      .setColor('Gold')
      .setDescription('Tem certeza que deseja fechar seu carrinho?')

    const messagePrimary = await interaction.editReply({
      embeds: [embed],
      components: [createRow(
        new ButtonBuilder({ custom_id: 'payment-confirm-delete', label: 'Confirmar', style: ButtonStyle.Success }),
        new ButtonBuilder({ custom_id: 'payment-cancel-delete', label: 'Cancelar', style: ButtonStyle.Danger })
      )]
    })
    const collector = messagePrimary.createMessageComponentCollector({ componentType: ComponentType.Button })
    collector.on('collect', async (subInteraction) => {
      collector.stop()
      const clearData = { components: [], embeds: [] }

      if (subInteraction.customId === 'payment-cancel-delete') {
        await subInteraction.update({
          ...clearData,
          embeds: [
            new EmbedBuilder()
              .setDescription('Você cancelou a ação')
              .setColor('Green')
          ]
        })
      } else if (subInteraction.customId === 'payment-confirm-delete') {
        const embed = new EmbedBuilder()
          .setColor('Red')
          .setTitle(`👋 | Olá ${interaction.user.username}`)
          .setDescription('❗️ | Esse carrinho será excluído em 5 segundos.')

        await subInteraction.update({
          ...clearData,
          embeds: [embed]
        })

        try {
          const paymentId = await db.payments.get(`${guildId}.process.${channelId}.paymentId`)

          if (paymentId !== undefined) {
            const token = await db.payments.get(`${guildId}.config.mcToken`)

            await axios.post(`http://${settings.Express.ip}:${settings.Express.Port}/payment/delete`, {
              mpToken: token,
              paymentId
            }).catch(async (err) => {
              await subInteraction.followUp({
                embeds: [new EmbedBuilder({
                  title: '❌ | Ocorreu um erro ao pedir que o Mercado Pago removesse o pedido de pagamento.'
                }).setColor('Red')]
              })
              throw new Error(err)
            })
          }

          await message.delete()
          await db.payments.delete(`${guildId}.process.${channelId}`)

          setTimeout(() => {
            subInteraction?.channel?.delete().catch(console.error)
          }, 5000)
        } catch (err) {
          console.log(err)
        }
      }
    })
  }

  /**
   * Botão que exibe as informações atuais do Pedido.
   */
  public async WTF (): Promise<void> {
    const { interaction, key } = this
    const { guildId, message, channelId } = interaction
    const { typeEmbed } = await db.payments.get(`${guildId}.process.${channelId}`)
    const embed = new EmbedBuilder().setColor('Purple')
    if (typeEmbed === 0 || typeEmbed === undefined) {
      embed
        .setTitle('Etapa [0]')
        .setDescription('Ao interagir com os botões (+ e -), é possivel adicionar/remover itens do seu carrinho.\nAo clicar em (🎫) você poderá adicionar um cupom ao seu carrinho.')
    } else if (typeEmbed === 1) {
      embed
        .setTitle('Etapa [1]')
        .setDescription('Selecione o tipo de resgate, existem 2 metodos:')
        .addFields(
          {
            name: '**💬 Mensagem via DM:**',
            value: 'Você receberá um código via DM, que será resgatável pelo [Dash](https://dash.seventyhost.net/)'
          },
          {
            name: '**📲 Instantaneamente:**',
            value: 'Os créditos surgiram na sua conta, sem precisar resgata-lo manualmente.'
          }
        )
    } else if (typeEmbed === 2) {
      embed
        .setTitle('Etapa [2]')
        .setDescription('Selecione o método de pagamento:\nExistem 3 metodos, e suas taxas:\n- 💠 PIX (1%).\n- 💳 Cartão de Débito (1.99%)\n- 💳 Cartão de Crédito (4.98%)\n \n> Essa taxa é imposta pelo Mercado Pago.')
    }
    await interaction.editReply({ embeds: [embed] })
      .then(async () => {
        await db.payments.set(`${guildId}.process.${channelId}.properties.${key}_${typeEmbed}`, true)

        const data = await db.payments.get(`${guildId}.process.${channelId}`)
        const cartBuilder = new UpdateCart({ interaction, cartData: data })

        await cartBuilder.embedAndButtons({ message })
      })
  }

  /**
   * Adiciona/Remove do Usuário oa itens do carrinho.
   */
  public async AddOrRem (options: {
    type: 'Add' | 'Rem'
  }): Promise<void> {
    const { interaction } = this
    if (!interaction.isButton()) return

    const { type } = options
    const { guildId, message, channelId } = interaction
    const { products } = await db.payments.get(`${guildId}.process.${channelId}`) as cartData
    const indexProduct = products.findIndex((product) => product.messageId === message.id)
    if (indexProduct === undefined) {
      await interaction.editReply({
        embeds: [new EmbedBuilder({
          title: '❌ | Esse Produto não existe em meu Database!'
        }).setColor('Red')]
      })
      return
    }
    const product = products[indexProduct]

    if (type === 'Add') {
      if (product?.cupom !== undefined) {
        const cupomData = await db.payments.get(`${guildId}.cupons.${product.cupom.name.toLowerCase()}`)
        if (cupomData?.usosMax !== null && ((product.quantity + 1) > cupomData.usosMax)) {
          await interaction.editReply({
            embeds: [
              new EmbedBuilder({
                title: `Este cupom não permite ser utilizado em mais de ${cupomData.usosMax} produto(s)`
              }).setColor('Red')
            ]
          })
          return
        }
      }
      await db.payments.add(`${guildId}.process.${channelId}.products.${indexProduct}.quantity`, 1)
    } else if (type === 'Rem' && product !== undefined && product?.quantity > 1) {
      await db.payments.sub(`${guildId}.process.${channelId}.products.${indexProduct}.quantity`, 1)
    } else {
      await interaction.editReply({ content: '❌ | Não foi possivel completar a ação.' })
      return
    }
    const data = await db.payments.get(`${guildId}.process.${channelId}`) as cartData
    const cartBuilder = new UpdateCart({ interaction, cartData: data })
    await cartBuilder.embedAndButtons({})
    await interaction.deleteReply()
  }

  /**
   * Passar/Retroceder a etapa do pagamento.
   */
  public async NextOrBefore (options: {
    type: 'next' | 'before'
    update?: 'Yes' | 'No'
    message?: string
  }): Promise<void> {
    const { interaction } = this
    const { type, update, message: messageWarn } = options
    const { guildId, user, message, channelId } = interaction

    let data = await db.payments.get(`${guildId}.process.${channelId}`) as cartData
    const { products, typeEmbed, typeRedeem } = data
    const cartChannelId = data?.channelId

    function stringNextBefore (numberType: number): string {
      let typeString
      switch (numberType) {
        case 0: {
          typeString = 'Quantidade & Cupom'
          break
        }
        case 1: {
          typeString = 'Forma de Envio'
          break
        }
        case 2: {
          typeString = 'Forma de Pagamento'
          break
        }
        case 3: {
          typeString = 'Pagamento'
          break
        }
        default: {
          typeString = 'Indefinido (ERRO)'
        }
      }
      return typeString
    }

    if (type === 'next') {
      if (data?.typeEmbed !== undefined) {
        if (
          (typeEmbed === 0 && products.map((product) => product.quantity).some((quantity) => quantity >= 1)) ||
          (typeEmbed === 1 && typeRedeem !== undefined && typeRedeem >= 1) ||
          (typeEmbed === 2)
        ) {
          const number = await db.payments.add(`${guildId}.process.${channelId}.typeEmbed`, 1)
          const typeString = stringNextBefore(number)

          await interaction.editReply({
            embeds: [
              new EmbedBuilder({
                title: 'Proxima Etapa',
                description: messageWarn ?? `⏭️ | Olá ${user.username}, agora estamos na etapa de ***${typeString}***`
              }).setColor('LightGrey')
            ]
          })
        } else {
          await interaction.editReply({
            embeds: [
              new EmbedBuilder({
                title: '😶 | Desculpe-me',
                description: 'Mas você não pode simplesmente pular a etapa, termine de selecionar as opções.'
              }).setColor('Aqua')
            ]
          })
          return
        }
      }
    } else {
      if (data?.typeEmbed !== undefined && data.typeEmbed > 0) {
        const number = await db.payments.sub(`${guildId}.process.${channelId}.typeEmbed`, 1)
        const typeString = stringNextBefore(number)

        await interaction.editReply({
          embeds: [
            new EmbedBuilder({
              title: 'Etapa Anterior',
              description: `◀️ | Voltamos para a etapa de ***${typeString}***`
            }).setColor('Orange')
          ]
        })
      }
    }
    if (update === undefined || update === 'Yes') {
      data = await db.payments.get(`${guildId}.process.${channelId}`) as cartData
      const cartBuilder = new UpdateCart({ interaction, cartData: data })
      await cartBuilder.embedAndButtons({ message })
    }
    if (typeEmbed === 0 && cartChannelId !== undefined) {
      const channelCart = await interaction.guild?.channels.fetch(cartChannelId)
      for (const [position, product] of products.entries()) {
        if (channelCart instanceof TextChannel && product.messageId !== undefined) {
          const msg = await channelCart?.messages.fetch(product.messageId).catch((err) => { console.log(err) })
          if (msg instanceof Message) await msg.delete()
          await db.payments.delete(`${guildId}.process.${channelId}.products.${position}.messageId`)
        }
      }
    }
  }

  /**
   * Verificar se o pagamento foi bem sucedido
   */
  public async verifyPayment (): Promise<undefined> {
    const { interaction } = this
    if (!interaction.inCachedGuild()) return
    if (!interaction.isButton()) return
    const { guildId, message, user, guild, member, channelId } = interaction
    const cartData = await db.payments.get(`${guildId}.process.${channelId}`) as cartData
    const tokenAuth = await db.tokens.get('token')
    const mpToken = await db.payments.get(`${guildId}.config.mcToken`)
    const valorTotal: number = cartData.products.reduce((allValue, product) => allValue + (product.quantity * product.amount), 0) ?? 0
    const coinsTotal: number = cartData.products.reduce((allCoins, product) => allCoins + (((product?.coins ?? 0) * product.quantity) ?? 0), 0) ?? 0
    const productsTotal: string = cartData.products.map((product) => product.name).join(' - ')

    if (cartData?.paymentId !== undefined) {
      const pagamentoRes = await axios.post(`http://${settings.Express.ip}:${settings.Express.Port}/payment`, {
        mpToken,
        paymentId: cartData.paymentId
      })

      if (pagamentoRes.status !== 200) {
        await interaction.editReply({
          embeds: [
            new EmbedBuilder({
              title: 'Ocorreu um erro na solicitação do back-end',
              fields: [
                { name: 'Status', value: (String(pagamentoRes?.status) ?? 'Indefinido') },
                { name: 'Error', value: (pagamentoRes.statusText ?? 'Indefinido') }
              ]
            }).setColor('Red')
          ]
        })
        return
      }

      if (pagamentoRes.data.status === 'approved') {
        const cartBuilder = new UpdateCart({ interaction, cartData })
        const components = await cartBuilder.typeButtons()
        components[0].components[1].setDisabled(true)

        let voucherCode: string | undefined
        let voucherId: number | undefined
        await message.edit({ components })
        await interaction.channel?.send({
          embeds: [
            new EmbedBuilder({
              title: '**✅ Pagamento aprovado com sucesso!**',
              description: '',
              footer: { text: 'Esse carrinho será fechado em 15 segundos.' },
              timestamp: new Date()
            }).setColor('Green')
          ]
        })
        await interaction.deleteReply()

        if (cartData.typeRedeem === 2) {
          if (
            cartData.products !== undefined &&
            cartData.user?.email !== undefined &&
            cartData.user?.name !== undefined &&
            cartData?.UUID !== undefined
          ) {
            const [userCoins, dashLink] = await ctrlPanel.updateUser({
              guildId,
              userID: cartData.user?.id,
              post: {
                credits: coinsTotal,
                email: cartData.user.email,
                name: cartData.user.name,
                role: 'client'
              }
            })

            const embed = new EmbedBuilder({
              title: 'Seus créditos foram entregues!'
            }).setColor('Green')

            if (userCoins !== undefined) {
              embed.addFields({
                name: '🪙 | Seus Créditos:',
                value: String(userCoins)
              })
            }

            const components: Array<ActionRowBuilder<ButtonBuilder>> = []

            if (dashLink !== undefined) {
              components[0] = new ActionRowBuilder()
              components[0].addComponents([
                new ButtonBuilder({
                  url: dashLink,
                  style: ButtonStyle.Link,
                  label: 'Dash'
                })
              ])
            }

            await interaction.channel?.send({
              content: `<@${user.id}>`,
              embeds: [embed],
              components
            })
            if (cartData.UUID !== undefined) {
              embed.addFields(
                {
                  name: '🆔 ID:',
                  value: `||${cartData.paymentId}||`
                },
                {
                  name: '📋 UUID:',
                  value: `||${cartData.UUID}||`
                }
              )
            }
            await user.send({
              embeds: [embed]
            })
          } else {
            await interaction.channel?.send({
              content: '@everyone',
              embeds: [
                new EmbedBuilder({
                  title: 'Falta informações!',
                  description: 'Ao consultar o database, foi detectado uma anomalia',
                  fields: [
                    { name: 'E-mail', value: (cartData?.user?.email ?? 'Error') },
                    { name: 'userName', value: (cartData?.user?.name ?? 'Error') },
                    { name: 'Coins', value: (String(coinsTotal) ?? 'Error') },
                    { name: 'UUID', value: (String(cartData?.UUID) ?? 'Error') }
                  ]
                }).setColor('Red')
              ]
            })
            components[0].components[1].setDisabled(false)
            await message.edit({ components }) // Retira o desabilitar do botão verificar
            return
          }
        } else {
          const Post = {
            token: tokenAuth,
            guild: {
              id: guild.id,
              name: guild.name
            },
            user: {
              id: user.id,
              name: user.username
            },
            productId: cartData.paymentId,
            credits: coinsTotal,
            price: valorTotal,
            name: productsTotal
          }

          const response = await axios.post(`http://${settings.Express.ip}:${settings.Express.Port}/ctrlpanel/voucher/create`, Post, {
            headers: {
              Accept: 'application/json'
            }
          })
          voucherCode = response.data.code
          voucherId = response.data.id
          if ((response?.status !== 200) || (response?.data?.status !== undefined && response?.data?.status !== 200)) {
            await interaction.channel?.send({
              content: '@everyone',
              embeds: [
                new EmbedBuilder({
                  title: 'Ocorreu um erro, chame um moderador!',
                  fields: [
                    {
                      name: 'ID:',
                      value: `||${cartData.paymentId}||`
                    },
                    {
                      name: 'UUID:',
                      value: `||${cartData.UUID}||`
                    }
                  ],
                  timestamp: new Date(),
                  footer: { text: `Code Error: ${response?.data?.status ?? response.status}, Error ${response?.data?.error ?? response.statusText}` }
                }).setColor('Red')
              ]
            })
            core.info(`Ocorreu um erro no Pagamento (ID: ${cartData.paymentId}) do usuário ${user.username} (ID: ${user.id})!`)
            return
          } else {
            const embeds = [
              new EmbedBuilder({
                title: 'Compra efetuada com sucesso!',
                description: `<@${user.id}> Agradecemos por escolher nossos produtos e serviços e esperamos atendê-lo novamente em breve.`,
                fields: [
                  { name: `🛒 | Produto${cartData.products.length > 1 ? '(s)' : ''}: `, value: (productsTotal ?? 'Error') },
                  { name: '💰 | Créditos: ', value: (String(coinsTotal ?? 'Error')) },
                  { name: '💵 | Valor: ', value: `R$${valorTotal}` },
                  {
                    name: '📆 | Data: ',
                    value: codeBlock(new Date(Date.now()).toLocaleString('pt-BR'))
                  },
                  { name: '🔑 | UUID:', value: codeBlock(String(cartData.paymentId)) }
                ],
                thumbnail: { url: 'https://cdn.discordapp.com/attachments/864381672882831420/1028234365248995368/aprove.gif' },
                footer: { iconURL: (interaction?.guild?.iconURL({ size: 64 }) ?? undefined), text: `Atenciosamente, ${guild.name}` }
              }).setColor('Green'),

              new EmbedBuilder({
                title: 'Resgate o Código aqui!',
                description: 'Vá até loja, e clique em “Código de resgate” ',
                fields: [
                  {
                    name: '💎 | Código de resgate: ',
                    value: response.data.code
                  },
                  {
                    name: '🔑 | ID: ',
                    value: codeBlock(response.data.id)
                  }
                ],
                footer: { iconURL: (interaction?.guild?.iconURL({ size: 64 }) ?? undefined), text: 'No celular, pressione o código para copiar.' },
                url: 'https://dash.seventyhost.net',
                image: { url: 'https://cdn.discordapp.com/attachments/1031659863757041674/1161136544128700546/image.png' }
              })
                .setColor('Blue'),
              new EmbedBuilder().setURL('https://dash.seventyhost.net').setImage('https://cdn.discordapp.com/attachments/1031659863757041674/1161137302920253470/image.png')
            ]

            await interaction?.channel?.send({
              embeds: [
                new EmbedBuilder({
                  title: 'O código de resgate foi enviado para o seu PV.'
                }).setColor('Purple')
              ]
            })

            await user.send({
              embeds
            })
          }
        }

        core.info(`Pagamento (ID: ${cartData.paymentId}) do usuário ${user.username} (ID: ${user.id}) foi aprovado com sucesso!`)

        await db.payments.set(`approved.${cartData.paymentId}`, {
          paymentId: cartData.paymentId,
          userName: user.username,
          userId: user.id,
          price: valorTotal,
          product: productsTotal,
          voucherId,
          voucherCode
        })

        if (cartData.role !== undefined) {
          member.roles.add(cartData.role).catch((err) => { console.log(err) })
        }

        setTimeout(() => {
          void db.payments.delete(`${guildId}.process.${channelId}`)
          interaction?.channel?.delete().catch(console.error)
        }, 15000)
        return undefined
      } else {
        await interaction.editReply({
          embeds: [
            new EmbedBuilder({
              title: 'Status atual da compra está como ' + '`' + pagamentoRes.data.status + '`',
              timestamp: new Date()
            }).setColor('Orange')
          ]
        })
      }
    } else {
      await interaction.editReply({
        embeds: [
          new EmbedBuilder({
            title: '🟠 Pagamento não foi definido, acesse a URL acima.'
          }).setColor('Orange')
        ]
      })
    }
  }

  /**
   * Remova o item do carrinho, se não houver nenhum item, o carrinho é fechado.
   */
  public async RemoveItem (): Promise<void> {
    const { interaction } = this
    if (!interaction.isButton()) return
    const { message, guildId, channelId, channel } = interaction
    const cartData = await db.payments.get(`${guildId}.process.${channelId}`) as cartData
    const indexToRemove = cartData.products.findIndex((product) => product.messageId === message.id)

    try {
      await message.delete()

      if (cartData.products.length <= 1) {
        await db.payments.delete(`${guildId}.process.${channelId}`)
        channel?.delete().catch(console.error)
      } else {
        cartData.products.splice(indexToRemove, 1)
        await db.payments.set(`${guildId}.process.${channelId}`, cartData)
        await interaction.editReply({
          embeds: [
            new EmbedBuilder({
              title: '📦 Produto removido com sucesso!'
            }).setColor('Green')
          ]
        })
        const data = await db.payments.get(`${guildId}.process.${channelId}`) as cartData
        const cartBuilder = new UpdateCart({ interaction, cartData: data })
        await cartBuilder.embedAndButtons({})
      }
    } catch (err) {
      console.log(err)
      await interaction.editReply({
        embeds: [
          new EmbedBuilder({
            title: '❌ | Ocorreu um erro ao remover o item!'
          })
        ]
      })
    }
  }
}
