import cartButtons from './cartCollector/collectorButtons'
import cartModal from './cartCollector/collectorModal'
import { Discord } from '@/functions'
import productButtons from './productCollector/collectorButtons'
import productModal from './productCollector/collectorModal'
import configModal from './configCollector/collectorModal'

export * from './functions/updateProduct'
export * from './functions/createProduct'
export * from './functions/updateCart'
export * from './functions/createCart'
export * from './functions/interfaces'

// cartComponents
const buttons = {
  Direct: {
    modal: true,
    title: '❓| Qual é o seu email cadastrado no Dash?',
    label: 'Seu E-mail',
    style: 1,
    type: 'email'
  },
  Cupom: {
    modal: true,
    title: '❓| Qual cupom deseja utilizar?',
    label: 'Seu Cupom',
    style: 1,
    type: 'cupom.name'
  },
  DM: {},
  WTF: {},
  Cancelar: {},
  GerarPix: {},
  GerarCardDebito: {},
  GerarCardCredito: {},
  Add: {},
  Rem: {},
  Next: {},
  Before: {},
  Verify: {}
}

// Config Components
const modalConfig = {
  mcConfig: {}
}

// Product Components
const buttonsModals = {
  SetPrice: {
    modal: true,
    title: '❓| Qual será o preço do produto?',
    label: 'Preço do produto',
    placeholder: 'Ex: 14,50',
    style: 1,
    maxLength: 6,
    type: 'price'
  },
  AddCoins: {
    modal: true,
    title: '❓| Quantas moedas será dado na compra?',
    label: 'Moedas do plano',
    placeholder: 'Ex: 2000',
    style: 1,
    maxLength: 10,
    type: 'coins'
  },
  SetRole: {
    modal: true,
    title: '❓| Qual será o id a ser adquirido na compra?',
    label: 'Coloque um ID, ou digite "VAZIO"',
    placeholder: 'Ex: 379089880887721995',
    style: 1,
    maxLength: 30,
    type: 'role'
  },
  Save: {},
  Config: {},
  Status: {},
  Buy: {},
  SetCtrlPanel: {},
  SetEstoque: {},
  Export: {},
  Import: {}
}

// eslint-disable-next-line array-callback-return
Object.entries(buttons).map(async ([key, value]) => {
  await Discord.registerComponent({
    customId: key,
    type: 'Button',
    async run (buttonInteraction) {
      const isButton = (value as { button?: boolean })?.button ?? true
      if (isButton) {
        await cartButtons(buttonInteraction, key, value)
      }
    }
  })
  await Discord.registerComponent({
    customId: key,
    type: 'Modal',
    async run (modalInteraction) {
      const isModal = (value as { modal?: boolean })?.modal ?? false
      if (isModal) {
        await cartModal(modalInteraction, key, value)
      }
    }
  })
})

Object.entries(modalConfig).map(async ([key, value]) => {
  await Discord.registerComponent({
    customId: key,
    type: 'Modal',
    async run (modalInteraction) {
      const isModal = (value as { modal?: boolean })?.modal ?? true
      if (isModal) {
        await configModal(modalInteraction)
      }
    }
  })
})

// eslint-disable-next-line array-callback-return
Object.entries(buttonsModals).map(async ([key, value]) => {
  await Discord.registerComponent({
    customId: key,
    type: 'Button',
    async run (interaction) {
      const isButton = (value as { button?: boolean })?.button ?? true
      if (isButton) {
        await productButtons(interaction, key, value)
      }
    }
  })
  await Discord.registerComponent({
    customId: key,
    type: 'Modal',
    async run (modalInteraction) {
      const isModal = (value as { modal?: boolean })?.modal ?? false
      if (isModal) {
        await productModal(modalInteraction, key, value)
      }
    }
  })
})
