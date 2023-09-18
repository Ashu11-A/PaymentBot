import { Command, Component } from '@/discord/base'
import { ApplicationCommandType } from 'discord.js'
import collectorButtons from './collector/collectorButtons'
import collectorModal from './collector/collectorModal'

const buttonsModals = {
  paymentSetPrice: {
    button: true,
    title: '❓| Qual será o preço do produto?',
    label: 'Preço do produto',
    placeholder: 'Ex: 14,50',
    style: 1,
    maxLength: 6,
    type: 'embed.fields[0].value'
  },
  paymentSetRole: {
    button: true,
    title: '❓| Qual será o id a ser adquirido na compra?',
    label: 'Coloque um ID, ou digite "VAZIO"',
    placeholder: 'Ex: 379089880887721995',
    style: 1,
    maxLength: 30,
    type: 'role'
  },
  paymentSave: {
    button: true
  },
  paymentConfig: {
    button: true
  },
  paymentStatus: {
    button: true
  }
}

new Command({
  name: 'comprar',
  nameLocalizations:
    {
      'en-US': 'buy'
    },
  description: '[ 🛒 Pagamentos ] Comprar um determinado valor',
  dmPermission,
  type: ApplicationCommandType.ChatInput,
  async run (interaction) {
    await interaction.reply({ content: 'Olá', ephemeral: true })
  }
})

Object.entries(buttonsModals).map(([key, value]) => {
  return new Component({
    customId: key,
    type: 'Button',
    async run (buttonInteraction) {
      if (value.button) {
        await collectorButtons(buttonInteraction, key, value)
      }
    }
  })
})

Object.entries(buttonsModals).map(([key, value]) => {
  return new Component({
    customId: key,
    type: 'Modal',
    async run (modalInteraction) {
      if (value.button) {
        await collectorModal(modalInteraction, key, value)
      }
    }
  })
})
