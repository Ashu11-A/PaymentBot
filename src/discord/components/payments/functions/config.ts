import { db } from '@/app'
import { type CommandInteraction, ActionRowBuilder, ModalBuilder, TextInputBuilder } from 'discord.js'

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class paymentConfig {
  /**
    * Modal para configuraro MercadoPago
    */
  public static async MPconfig (options: {
    interaction: CommandInteraction
  }): Promise<void> {
    const { interaction } = options
    const { guildId } = interaction

    const data = await db.payments.get(`${guildId}.config`)

    const modal = new ModalBuilder({ customId: 'mcConfig', title: 'Configure aspectos do Mercado Pago.' })
    const token = new ActionRowBuilder<TextInputBuilder>({
      components: [
        new TextInputBuilder({
          custom_id: 'token',
          label: 'Token',
          placeholder: data?.mcToken === undefined ? 'Não compartilhe isso com ninguém.' : 'Já configurado...',
          style: 1,
          required: data?.mcToken === undefined
        })
      ]
    })

    const ipnURL = new ActionRowBuilder<TextInputBuilder>({
      components: [
        new TextInputBuilder({
          custom_id: 'ipn',
          label: 'URL da IPN',
          value: data?.ipn,
          style: 1,
          required: true
        })
      ]
    })

    const taxaPix = new ActionRowBuilder<TextInputBuilder>({
      components: [
        new TextInputBuilder({
          custom_id: 'taxaPix',
          label: 'Taxa do Pix',
          placeholder: 'Ex: 1',
          style: 1,
          value: data?.taxes?.pix,
          required: true
        })
      ]
    })

    const taxaCardDebit = new ActionRowBuilder<TextInputBuilder>({
      components: [
        new TextInputBuilder({
          custom_id: 'taxaCardDebit',
          label: 'Taxa do Cartão de Debito',
          placeholder: 'Ex: 2',
          style: 1,
          value: data?.taxes?.debit_card,
          required: true
        })
      ]
    })

    const taxaCardCredit = new ActionRowBuilder<TextInputBuilder>({
      components: [
        new TextInputBuilder({
          custom_id: 'taxaCardCredit',
          label: 'Taxa do Cartão de Crédito',
          placeholder: 'Ex: 4.98',
          style: 1,
          value: data?.taxes?.credit_card,
          required: true
        })
      ]
    })

    modal.setComponents(token, ipnURL, taxaPix, taxaCardDebit, taxaCardCredit)
    await interaction.showModal(modal)
  }
}
