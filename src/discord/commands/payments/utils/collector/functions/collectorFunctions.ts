import { db } from '@/app'
import { ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder, type ButtonInteraction, type CacheType } from 'discord.js'
import { paymentEmbed } from '../../paymentEmbed'
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
   * name
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
   * name
   */
  public static async paymentUserWTF (options: {
    interaction: ButtonInteraction<CacheType>
  }): Promise<void> {
    const { interaction } = options
    const { guildId, user } = interaction
    const { typeEmbed } = await db.payments.get(`${guildId}.process.${user.id}`)
    if (typeEmbed === 1 || typeEmbed === undefined) {
      const embed = new EmbedBuilder({
        title: '[1] Nesta etapa, selecione o tipo de resgate.',
        description: 'Existem 2 metodos:',
        fields: [
          {
            name: '**💬 Mensagem via DM:**',
            value: 'Você receberá um código de resgate via DM, que será resgatável pelo [Dash](https://dash.seventyhost.net/)'
          },
          {
            name: '**📲 Diretamente ao Dash:**',
            value: 'Os créditos surgiram na sua conta, sem precisar ter que resgatar o código manualmente.'
          }
        ]
      }).setColor('Purple')
      await interaction.reply({ embeds: [embed], ephemeral })
    }
  }
}
