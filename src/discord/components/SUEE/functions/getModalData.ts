import { type collectorButtonsForModals } from '@/interfaces'
import { ComponentType } from 'discord.js'

const modalData: Record<string, collectorButtonsForModals> = {
  SetName: {
    title: '❓| Qual será o Título da Embed?',
    label: 'Título da embed',
    placeholder: 'Ex: Pegue seu embed!',
    style: 1,
    maxLength: 256,
    db: 'embed.title',
    type: ComponentType.TextInput,
    customId: 'content'
  },
  SetDesc: {
    title: '❓| Qual será a Descrição da Embed?',
    label: 'Descrição do produto',
    placeholder: 'Ex: Basta abrir seu embed e aguardar um membro dê nossa equipe para lhe ajudar.',
    style: 2,
    maxLength: 4000,
    db: 'embed.description',
    type: ComponentType.TextInput,
    customId: 'content'
  },
  SetMiniature: {
    title: '❓| Qual será a Miniatura da Embed?',
    label: 'Coloque um Link, ou digite "VAZIO"',
    placeholder: 'Ex: https://uma.imagemBem.ilustrativa/img.png',
    style: 1,
    maxLength: 4000,
    db: 'embed.thumbnail.url',
    type: ComponentType.TextInput,
    customId: 'content'
  },
  SetBanner: {
    title: '❓| Qual será o Banner da Embed?',
    label: 'Coloque um Link, ou digite "VAZIO"',
    placeholder: 'Ex: https://um.bannerBem.legal/img.png',
    style: 1,
    maxLength: 4000,
    db: 'embed.image.url',
    type: ComponentType.TextInput,
    customId: 'content'
  },
  SetColor: {
    title: '❓| Qual será a Cor da Embed?',
    label: 'Cor em hexadecimal',
    placeholder: 'Ex: #13fc03',
    style: 1,
    maxLength: 7,
    db: 'embed.color',
    type: ComponentType.TextInput,
    customId: 'content'
  }
}

export function getModalData (key: string): collectorButtonsForModals {
  return modalData[key]
}
