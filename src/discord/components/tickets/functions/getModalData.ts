import { type collectorButtonsForModals } from '@/settings/interfaces/Collector'

const buttonsModals: Record<string, collectorButtonsForModals> = {
  SetRole: {
    title: '❓| ID marcado na criação do Ticket',
    label: 'Coloque um ID, ou digite "VAZIO"',
    placeholder: 'Ex: 379089880887721995',
    style: 1,
    maxLength: 30,
    type: 'role'
  },
  AddSelect: {
    type: 'select'
  },
  SendSave: {
    title: '❓| ID do channel',
    label: 'Coloque um ID',
    placeholder: 'Ex: 379089880887721995',
    style: 1,
    maxLength: 30,
    type: 'embedChannelID'
  }
}

export function getModalData (key: string): collectorButtonsForModals {
  return buttonsModals[key]
}
