import collectorButtons from './cardCollector/collectorButtons'
import collectorModal from './cardCollector/collectorModal'
import { Discord } from '@/functions'

const buttons = {
  paymentUserDirect: {
    modal: true,
    title: '❓| Qual é o seu email cadastrado no Dash?',
    label: 'Seu E-mail',
    style: 1,
    type: 'email'
  },
  paymentUserCupom: {
    modal: true,
    title: '❓| Qual cupom deseja utilizar?',
    label: 'Seu Cupom',
    style: 1,
    type: 'cupom.name'
  },
  paymentUserDM: {},
  paymentUserWTF: {},
  paymentUserCancelar: {},
  paymentUserGerarPix: {},
  paymentUserGerarCardDebito: {},
  paymentUserGerarCardCredito: {},
  paymentUserAdd: {},
  paymentUserRem: {},
  paymentUserNext: {},
  paymentUserBefore: {},
  paymentVerify: {}
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
      const isModal = (value as { modal?: boolean })?.modal ?? false
      if (isModal) {
        await collectorModal(modalInteraction, key, value)
      }
    }
  })
})
