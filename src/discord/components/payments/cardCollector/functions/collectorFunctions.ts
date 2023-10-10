import { core, db } from '@/app'
import { ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder, type ButtonInteraction, type CacheType, codeBlock } from 'discord.js'
import { type Data, updateCard } from '@/discord/components/payments'
import { createRow } from '@magicyan/discord'
import mp from 'mercadopago'
import axios from 'axios'
import { settings } from '@/settings'

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class PaymentFunction {
  /**
     * Selecionar metodo de resgate.
     */
  public static async paymentUserDM (options: {
    interaction: ButtonInteraction<CacheType>
  }): Promise<void> {
    const { interaction } = options
    const { guildId, customId, message } = interaction
    await db.payments.set(`${guildId}.process.${message.id}.typeRedeem`, 1)
    await db.payments.set(`${guildId}.process.${message.id}.properties.${customId}`, true)
    await db.payments.delete(`${guildId}.process.${message.id}.properties.paymentUserDirect`)
    await db.payments.delete(`${guildId}.process.${message.id}.user`)
    const data = await db.payments.get(`${guildId}.process.${message.id}`)
    await updateCard.embedAndButtons({
      interaction,
      data,
      message
    })
    await updateCard.displayData({
      interaction,
      data,
      type: 'editReply'
    })
  }

  /**
   * Cancelar Pedido (Deleta database e chat)
   */
  public static async paymentUserCancelar (options: {
    interaction: ButtonInteraction<CacheType>
  }): Promise<void> {
    const { interaction } = options
    const { message, guildId } = interaction

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
        await subInteraction.editReply({
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
          const paymentId = await db.payments.get(`${guildId}.process.${message.id}.paymentId`)

          if (paymentId !== undefined) {
            const token = await db.payments.get(`${guildId}.config.mcToken`)

            mp.configure({
              access_token: token
            })

            await mp.payment.cancel(paymentId)
          }

          await message.delete()
          await db.payments.delete(`${guildId}.process.${message.id}`)

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
  public static async paymentUserWTF (options: {
    interaction: ButtonInteraction<CacheType>
  }): Promise<void> {
    const { interaction } = options
    const { guildId, message, customId } = interaction
    const { typeEmbed } = await db.payments.get(`${guildId}.process.${message.id}`)
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
        await db.payments.set(`${guildId}.process.${message.id}.properties.${customId}_${typeEmbed}`, true)
        const data = await db.payments.get(`${guildId}.process.${message.id}`)

        await updateCard.embedAndButtons({
          interaction,
          message,
          data,
          typeEdit: 'update'
        })
      })
  }

  /**
   * Adiciona/Remove do Usuário oa itens do carrinho.
   */
  public static async AddOrRem (options: {
    interaction: ButtonInteraction<CacheType>
    type: 'Add' | 'Rem'
  }): Promise<void> {
    const { interaction, type } = options
    const { guildId, message } = interaction

    const { quantity } = await db.payments.get(`${guildId}.process.${message.id}`)

    if (type === 'Add') {
      await db.payments.add(`${guildId}.process.${message.id}.quantity`, 1)
    } else if (type === 'Rem' && quantity > 1) {
      await db.payments.sub(`${guildId}.process.${message.id}.quantity`, 1)
    } else {
      await interaction.editReply({ content: '❌ | Não foi possivel completar a ação.' })
      return
    }

    const data = await db.payments.get(`${guildId}.process.${message.id}`)

    await updateCard.embedAndButtons({
      interaction,
      data,
      message
    })

    await updateCard.displayData({
      interaction,
      data,
      type: 'editReply'
    })
  }

  /**
   * Passar/Retroceder a etapa do pagamento.
   */
  public static async NextOrBefore (options: {
    interaction: ButtonInteraction<CacheType>
    type: 'next' | 'before'
    update?: 'Yes' | 'No'
  }): Promise<void> {
    const { interaction, type, update } = options
    const { guildId, user, message } = interaction

    let data = await db.payments.get(`${guildId}.process.${message.id}`) as Data

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
          (data.typeEmbed === 0 && data?.quantity !== undefined && data.quantity >= 1) ||
          (data.typeEmbed === 1 && data?.typeRedeem !== undefined && data.typeRedeem >= 1) ||
          (data.typeEmbed === 2)
        ) {
          const number = await db.payments.add(`${guildId}.process.${message.id}.typeEmbed`, 1)
          const typeString = stringNextBefore(number)

          await interaction.editReply({
            embeds: [
              new EmbedBuilder({
                title: 'Proxima Etapa',
                description: `⏭️ | Olá ${user.username}, agora estamos na etapa de ***${typeString}***`
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
        const number = await db.payments.sub(`${guildId}.process.${message.id}.typeEmbed`, 1)
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
      data = await db.payments.get(`${guildId}.process.${message.id}`) as Data
      await updateCard.embedAndButtons({
        interaction,
        data,
        message
      })
    }
  }

  /**
   * Verificar se o pagamento foi bem sucedido
   */
  public static async verifyPayment (options: {
    interaction: ButtonInteraction<CacheType>
  }): Promise<any> {
    const { interaction } = options
    if (!interaction.inCachedGuild()) return
    const { guildId, message, user, guild } = interaction
    const cardData = await db.payments.get(`${guildId}.process.${message.id}`)
    const tokenAuth = await db.tokens.get('token')

    if (cardData?.paymentId !== undefined) {
      const token = await db.payments.get(`${guildId}.config.mcToken`)

      mp.configure({
        access_token: token
      })

      const res = await mp.payment.get(cardData.paymentId)
      const pagamentoStatus = res.body.status

      if (pagamentoStatus !== 'approved') {
        await interaction.message.delete()
        await interaction.editReply({
          embeds: [
            new EmbedBuilder({
              title: '**✅ Pagamento aprovado com sucesso!**',
              description: '',
              footer: { text: 'Esse carrinho será fechado em 15 segundos.' },
              timestamp: new Date()
            }).setColor('Green')
          ]
        })

        if (cardData.typeRedeem === 1) {
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
            productId: cardData.paymentId,
            credits: Number(cardData.coins),
            price: Number(cardData.amount),
            name: cardData.product
          }

          const response = await axios.post(`http://${settings.Express.ip}:${settings.Express.Port}/voucher`, Post, {
            headers: {
              Accept: 'application/json'
            }
          })
          if ((response?.status !== 200) || (response?.data?.status !== undefined && response?.data?.status !== 200)) {
            await interaction.channel?.send({
              content: '@everyone',
              embeds: [
                new EmbedBuilder({
                  title: 'Ocorreu um erro, chame um moderador!',
                  fields: [
                    {
                      name: 'ID:',
                      value: `||${cardData.paymentId}||`
                    },
                    {
                      name: 'UUID:',
                      value: `||${cardData.UUID}||`
                    }
                  ],
                  timestamp: new Date(),
                  footer: { text: `Code Error: ${response?.data?.status ?? response.status}, Error ${response?.data?.error ?? response.statusText}` }
                }).setColor('Red')
              ]
            })
            core.info(`Ocorreu um erro no Pagamento (ID: ${cardData.paymentId}) do usuário ${user.username} (ID: ${user.id})!`)
            return
          } else {
            const embeds = [
              new EmbedBuilder({
                title: 'Compra efetuada com sucesso!',
                description: `<@${user.id}> Agradecemos por escolher nossos produtos e serviços e esperamos atendê-lo novamente em breve.`,
                fields: [
                  { name: '🛒 | Produto: ', value: cardData.product },
                  { name: '💰 | Créditos: ', value: cardData.coins },
                  { name: '💵 | Valor: ', value: `R$${cardData.amount}` },
                  {
                    name: '📆 | Data: ',
                    value: codeBlock(new Date(Date.now()).toLocaleString('pt-BR'))
                  },
                  { name: '🔑 | ID:', value: codeBlock(cardData.paymentId) }
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

            await user.send({
              embeds
            })
          }
        }

        core.info(`Pagamento (ID: ${cardData.paymentId}) do usuário ${user.username} (ID: ${user.id}) foi aprovado com sucesso!`)

        setTimeout(() => {
          void db.payments.delete(`${guildId}.process.${message.id}`)
          interaction?.channel?.delete().catch(console.error)
        }, 15000)
        return undefined
      } else {
        await interaction.editReply({
          embeds: [
            new EmbedBuilder({
              title: 'Status atual da compra está como ' + '`' + pagamentoStatus + '`',
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
}
