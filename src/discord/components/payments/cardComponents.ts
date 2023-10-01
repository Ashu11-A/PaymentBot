import collectorButtons from './cardCollector/collectorButtons'
import collectorModal from './cardCollector/collectorModal'
import { Discord } from '@/functions'

const buttons = {
  paymentUserDirect: {
    title: '❓| Qual é o seu email cadastrado no Dash?',
    label: 'Seu E-mail',
    style: 1,
    type: 'email'
  },
  paymentUserCupom: {
    title: '❓| Qual cupom deseja utilizar?',
    label: 'Seu Cupom',
    style: 1,
    type: 'cupom'
  },
  paymentUserDM: {
    modal: false
  },
  paymentUserWTF: {
    modal: false
  },
  paymentUserCancelar: {
    modal: false
  },
  paymentUserGerarPix: {
    modal: false
  },
  paymentUserGerarCardDebito: {
    modal: false
  },
  paymentUserGerarCardCredito: {
    modal: false
  },
  paymentUserAdd: {
    modal: false
  },
  paymentUserRem: {
    modal: false
  },
  paymentUserNext: {
    modal: false
  },
  paymentUserBefore: {
    modal: false
  }
}

// eslint-disable-next-line array-callback-return
Object.entries(buttons).map(async ([key, value]) => {
  await Discord.registerComponent({
    customId: key,
    type: 'Button',
    async run (buttonInteraction) {
      const isButton = (value as { button?: boolean })?.button ?? true
      if (isButton) {
        await collectorButtons(buttonInteraction, key, value)
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
