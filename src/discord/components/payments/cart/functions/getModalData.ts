import { type collectorButtonsForModals } from '@/settings/interfaces/Collector'

const cartModals: Record<string, collectorButtonsForModals> = {
  Direct: {
    title: '❓| Qual é o seu email cadastrado no Dash?',
    label: 'Seu E-mail',
    style: 1,
    type: 'email'
  },
  Cupom: {
    title: '❓| Qual cupom deseja utilizar?',
    label: 'Seu Cupom',
    style: 1,
    type: 'cupom.name'
  }
}

export function getModalData (key: string): collectorButtonsForModals {
  return cartModals[key]
}
