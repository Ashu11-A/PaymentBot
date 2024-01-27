import { type collectorButtonsForModals } from '@/settings/interfaces/Collector'

const modalData: Record<string, collectorButtonsForModals[]> = {
  Pterodactyl: [
    {
      label: 'Email para acesso ao Painel',
      placeholder: 'Ex: Ashu11-a@gmail.com',
      style: 1,
      maxLength: 256,
      customId: 'email'
    },
    {
      label: 'Nome de Usuário',
      placeholder: 'Ex: Ashu11-a',
      style: 1,
      maxLength: 256,
      customId: 'username'
    },
    {
      label: 'Primeiro Nome',
      placeholder: 'Será usado para registrar os pagamentos!',
      style: 1,
      maxLength: 256,
      customId: 'primeiro-nome'
    },
    {
      label: 'Último Nome',
      placeholder: 'Será usado para registrar os pagamentos!',
      style: 1,
      maxLength: 256,
      customId: 'ultimo-nome'
    }
  ],
  CtrlPanel: [
    {
      title: '❓| Qual será o Título da Embed?',
      label: 'Título da embed',
      placeholder: 'Ex: Pegue seu embed!',
      style: 1,
      maxLength: 256,
      type: 'embed.title'
    }
  ]
}

export function getModalData (key: string): collectorButtonsForModals[] {
  return modalData[key]
}
