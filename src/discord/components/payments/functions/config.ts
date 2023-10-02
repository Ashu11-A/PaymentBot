import { type CommandInteraction, ActionRowBuilder, ModalBuilder, TextInputBuilder } from 'discord.js'

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class paymentConfig {
  /**
    * Modal para configurar token
    */
  public static async token (options: {
    interaction: CommandInteraction
  }): Promise<void> {
    const { interaction } = options
    const modal = new ModalBuilder({ customId: 'mcConfig', title: 'Configure aspectos do Mercado Pago.' })
    const content = new ActionRowBuilder<TextInputBuilder>({
      components: [
        new TextInputBuilder({
          custom_id: 'content',
          label: 'Token',
          placeholder: 'Não compartilhe isso com ninguém.',
          style: 1,
          required: true
        })
      ]
    })
    modal.setComponents(content)
    await interaction.showModal(modal)
  }
}
