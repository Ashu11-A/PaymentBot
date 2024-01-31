import { type collectorButtonsForModals } from '@/interfaces'
import { ComponentType } from 'discord.js'

const cartModals: Record<string, collectorButtonsForModals> = {
  Direct: {
    title: '❓| Qual é o seu email cadastrado no Dash?',
    label: 'Seu E-mail',
    style: 1,
    db: 'email',
    type: ComponentType.TextInput,
    customId: 'content'
  },
  Cupom: {
    title: '❓| Qual cupom deseja utilizar?',
    label: 'Seu Cupom',
    style: 1,
    db: 'cupom.name',
    type: ComponentType.TextInput,
    customId: 'content'
  }
}

export function getModalData (key: string): collectorButtonsForModals {
  return cartModals[key]
}
