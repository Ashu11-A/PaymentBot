import { type collectorButtonsForModals } from '@/settings/interfaces/Collector'

type ModalType = Record<string, collectorButtonsForModals>
const productModal: ModalType = {
  SetPrice: {
    title: '❓| Qual será o preço do produto?',
    label: 'Preço do produto',
    placeholder: 'Ex: 14,50',
    style: 1,
    maxLength: 6,
    type: 'price'
  },
  AddCoins: {
    title: '❓| Quantas moedas será dado na compra?',
    label: 'Moedas do plano',
    placeholder: 'Ex: 2000',
    style: 1,
    maxLength: 10,
    type: 'coins'
  },
  SetRole: {
    title: '❓| Qual será o id a ser adquirido na compra?',
    label: 'Coloque um ID, ou digite "VAZIO"',
    placeholder: 'Ex: 379089880887721995',
    style: 1,
    maxLength: 30,
    type: 'role'
  },
  CPU: {
    title: '❓| CPU',
    label: 'Porcentagem de nucleos, 100 = 1 nucleo.',
    placeholder: 'Ex: 250',
    style: 1,
    maxLength: 4,
    type: 'pterodactyl.cpu'
  },
  Ram: {
    title: '❓| Memoria Ram',
    label: 'Quantos GB/MB de Ram?',
    placeholder: 'Ex: 1024M ou 1GB',
    style: 1,
    maxLength: 16,
    type: 'pterodactyl.ram'
  },
  Disk: {
    title: '❓| Armazenamento',
    label: 'Quanto de armazenamento o plano terá?',
    placeholder: 'Ex: 2048M ou 2GB',
    style: 1,
    maxLength: 30,
    type: 'pterodactyl.disk'
  },
  Port: {
    title: '❓| Portas de conexão',
    label: 'Quantas portas serão disponibilizadas?',
    placeholder: 'Ex: 3',
    style: 1,
    maxLength: 30,
    type: 'pterodactyl.port'
  }
}

export function getModalData (customID: string): collectorButtonsForModals {
  return productModal[customID]
}
