import { type collectorButtonsForModals } from '@/settings/interfaces/Collector'
import { ComponentType } from 'discord.js'

type ModalType = Record<string, collectorButtonsForModals>
const productModal: ModalType = {
  SetPrice: {
    title: '❓| Qual será o preço do produto?',
    label: 'Preço do produto',
    placeholder: 'Ex: 14,50',
    style: 1,
    maxLength: 6,
    db: 'price',
    type: ComponentType.TextInput,
    customId: 'content'
  },
  AddCoins: {
    title: '❓| Quantas moedas será dado na compra?',
    label: 'Moedas do plano',
    placeholder: 'Ex: 2000',
    style: 1,
    maxLength: 10,
    db: 'coins',
    type: ComponentType.TextInput,
    customId: 'content'
  },
  SetRole: {
    title: '❓| Qual será o id a ser adquirido na compra?',
    label: 'Coloque um ID, ou digite "VAZIO"',
    placeholder: 'Ex: 379089880887721995',
    style: 1,
    maxLength: 30,
    db: 'role',
    type: ComponentType.TextInput,
    customId: 'content'
  },
  CPU: {
    title: '❓| CPU',
    label: 'Porcentagem de nucleos, 100 = 1 nucleo.',
    placeholder: 'Ex: 250',
    style: 1,
    maxLength: 4,
    db: 'pterodactyl.cpu',
    type: ComponentType.TextInput,
    customId: 'content'
  },
  Ram: {
    title: '❓| Memoria Ram',
    label: 'Quantos GB/MB de Ram?',
    placeholder: 'Ex: 1024M ou 1GB',
    style: 1,
    maxLength: 16,
    db: 'pterodactyl.ram',
    type: ComponentType.TextInput,
    customId: 'content'
  },
  Disk: {
    title: '❓| Armazenamento',
    label: 'Quanto de armazenamento o plano terá?',
    placeholder: 'Ex: 2048M ou 2GB',
    style: 1,
    maxLength: 30,
    db: 'pterodactyl.disk',
    type: ComponentType.TextInput,
    customId: 'content'
  },
  Port: {
    title: '❓| Portas de conexão',
    label: 'Quantas portas serão disponibilizadas?',
    placeholder: 'Ex: 3',
    style: 1,
    maxLength: 30,
    db: 'pterodactyl.port',
    type: ComponentType.TextInput,
    customId: 'content'
  }
}

export function getModalData (customID: string): collectorButtonsForModals {
  return productModal[customID]
}
