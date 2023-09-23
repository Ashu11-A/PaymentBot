import { db } from '@/app'
import { ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder, type ButtonInteraction, type CacheType } from 'discord.js'
import { type Data, paymentEmbed } from '../../paymentEmbed'
import { createRow } from '@magicyan/discord'

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class PaymentFunction {
  /**
     * Selecionar metodo de resgate.
     */
  public static async paymentUserDM (options: {
    interaction: ButtonInteraction<CacheType>
  }): Promise<void> {
    const { interaction } = options
    const { guildId, user, customId, message } = interaction
    await db.payments.set(`${guildId}.process.${user.id}.typeRedeem`, 1)
    await db.payments.set(`${guildId}.process.${user.id}.properties.${customId}`, true)
    await db.payments.delete(`${guildId}.process.${user.id}.properties.paymentUserDirect`)
    const data = await db.payments.get(`${guildId}.process.${user.id}`)
    await paymentEmbed.TypeRedeem({
      interaction,
      data,
      message
    })
    await paymentEmbed.displayData({
      interaction,
      data
    })
  }

  /**
   * Cancelar Pedido (Deleta database e chat)
   */
  public static async paymentUserCancelar (options: {
    interaction: ButtonInteraction<CacheType>
  }): Promise<void> {
    const { interaction } = options
    const { message, guildId, user } = interaction
    await interaction.deferReply({ ephemeral: true })

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
          await message.delete()
          await db.payments.delete(`${guildId}.process.${user.id}`)

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
    const { guildId, user } = interaction
    const { typeEmbed } = await db.payments.get(`${guildId}.process.${user.id}`)
    const embed = new EmbedBuilder().setColor('Purple')
    if (typeEmbed === 0 || typeEmbed === undefined) {
      embed
        .setTitle('Etapa [0]')
        .setDescription('Ao interagir com os botões (+ e -), é possivel adicionar/remover itens do seu carrinho.\nAo clicar em (🎫) você poderá adicionar um cupom ao seu carrinho.')
    } else if (typeEmbed === 1 || typeEmbed === undefined) {
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
    }
    await interaction.reply({ embeds: [embed], ephemeral })
  }

  /**
   * Adiciona/Remove do Usuário oa itens do carrinho.
   */
  public static async AddOrRem (options: {
    interaction: ButtonInteraction<CacheType>
    type: 'Add' | 'Rem'
  }): Promise<void> {
    const { interaction, type } = options
    const { guildId, user, message } = interaction

    const { quantity } = await db.payments.get(`${guildId}.process.${user.id}`)

    if (type === 'Add') {
      await db.payments.add(`${guildId}.process.${user.id}.quantity`, 1)
    } else if (type === 'Rem' && quantity > 1) {
      await db.payments.sub(`${guildId}.process.${user.id}.quantity`, 1)
    } else {
      await interaction.reply({ content: '❌ | Não foi possivel completar a ação.' })
      return
    }

    const data = await db.payments.get(`${guildId}.process.${user.id}`)

    await paymentEmbed.TypeRedeem({
      interaction,
      data,
      message
    })

    await paymentEmbed.displayData({
      interaction,
      data
    })
  }

  /**
   * Passar/Retroceder a etapa do pagamento.
   */
  public static async NextOrBefore (options: {
    interaction: ButtonInteraction<CacheType>
    type: 'next' | 'before'
  }): Promise<void> {
    const { interaction, type } = options
    const { guildId, user, message } = interaction

    let data = await db.payments.get(`${guildId}.process.${user.id}`) as Data

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
          const number = await db.payments.add(`${guildId}.process.${user.id}.typeEmbed`, 1)
          const typeString = stringNextBefore(number)

          await interaction.reply({
            ephemeral,
            embeds: [
              new EmbedBuilder({
                title: 'Proxima Etapa',
                description: `⏭️ | Olá ${user.username}, agora estamos na etapa de ***${typeString}***`
              }).setColor('LightGrey')
            ]
          })
        } else {
          await interaction.reply({
            ephemeral,
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
        const number = await db.payments.sub(`${guildId}.process.${user.id}.typeEmbed`, 1)
        const typeString = stringNextBefore(number)

        await interaction.reply({
          ephemeral,
          embeds: [
            new EmbedBuilder({
              title: 'Etapa Anterior',
              description: `◀️ | Voltamos para a etapa de ***${typeString}***`
            }).setColor('Orange')
          ]
        })
      }
    }
    data = await db.payments.get(`${guildId}.process.${user.id}`) as Data
    await paymentEmbed.TypeRedeem({
      interaction,
      data,
      message
    })
  }
}
