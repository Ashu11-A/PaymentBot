import collectorButtons from './productCollector/collectorButtons'
import collectorModal from './productCollector/collectorModal'
import { Discord } from '@/functions'

const buttonsModals = {
  paymentSetPrice: {
    title: '❓| Qual será o preço do produto?',
    label: 'Preço do produto',
    placeholder: 'Ex: 14,50',
    style: 1,
    maxLength: 6,
    type: 'price'
  },
  paymentAddCoins: {
    title: '❓| Quantas moedas será dado na compra?',
    label: 'Moedas do plano',
    placeholder: 'Ex: 2000',
    style: 1,
    maxLength: 10,
    type: 'coins'
  },
  paymentSetRole: {
    title: '❓| Qual será o id a ser adquirido na compra?',
    label: 'Coloque um ID, ou digite "VAZIO"',
    placeholder: 'Ex: 379089880887721995',
    style: 1,
    maxLength: 30,
    type: 'role'
  },
  paymentSave: {
    modal: false
  },
  paymentConfig: {
    modal: false
  },
  paymentStatus: {
    modal: false
  },
  paymentBuy: {
    modal: false
  },
  paymentSetCtrlPanel: {
    modal: false
  },
  paymentSetEstoque: {
    modal: false
  },
  paymentExport: {
    modal: false
  },
  paymentImport: {
    modal: false
  }
}

// eslint-disable-next-line array-callback-return
Object.entries(buttonsModals).map(async ([key, value]) => {
  await Discord.registerComponent({
    customId: key,
    type: 'Button',
    async run (interaction) {
      const isButton = (value as { button?: boolean })?.button ?? true
      if (isButton) {
        await collectorButtons(interaction, key, value)
      }
    }
  })
  await Discord.registerComponent({
    customId: key,
    type: 'Modal',
    async run (modalInteraction) {
      const isModal = (value as { modal?: boolean })?.modal ?? true
      if (isModal) {
        await collectorModal(modalInteraction, key, value)
      }
    }
  })
})
