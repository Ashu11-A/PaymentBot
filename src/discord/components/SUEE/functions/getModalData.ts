import { type collectorButtonsForModals } from '@/settings/interfaces/Collector'

const modalData: Record<string, collectorButtonsForModals> = {
  SetName: {
    title: '❓| Qual será o Título da Embed?',
    label: 'Título da embed',
    placeholder: 'Ex: Pegue seu embed!',
    style: 1,
    maxLength: 256,
    type: 'embed.title'
  },
  SetDesc: {
    title: '❓| Qual será a Descrição da Embed?',
    label: 'Descrição do produto',
    placeholder: 'Ex: Basta abrir seu embed e aguardar um membro dê nossa equipe para lhe ajudar.',
    style: 2,
    maxLength: 4000,
    type: 'embed.description'
  },
  SetMiniature: {
    title: '❓| Qual será a Miniatura da Embed?',
    label: 'Coloque um Link, ou digite "VAZIO"',
    placeholder: 'Ex: https://uma.imagemBem.ilustrativa/img.png',
    style: 1,
    maxLength: 4000,
    type: 'embed.thumbnail.url'
  },
  SetBanner: {
    title: '❓| Qual será o Banner da Embed?',
    label: 'Coloque um Link, ou digite "VAZIO"',
    placeholder: 'Ex: https://um.bannerBem.legal/img.png',
    style: 1,
    maxLength: 4000,
    type: 'embed.image.url'
  },
  SetColor: {
    title: '❓| Qual será a Cor da Embed?',
    label: 'Cor em hexadecimal',
    placeholder: 'Ex: #13fc03',
    style: 1,
    maxLength: 7,
    type: 'embed.color'
  }
}

export function getModalData (key: string): collectorButtonsForModals {
  return modalData[key]
}
