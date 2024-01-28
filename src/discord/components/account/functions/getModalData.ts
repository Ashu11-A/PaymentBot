import { ComponentType, type TextInputComponentData } from 'discord.js'

const modalData: Record<string, TextInputComponentData[]> = {
  Pterodactyl: [
    {
      label: 'Email para acesso ao Painel',
      placeholder: 'Ex: Ashu11-a@gmail.com',
      style: 1,
      maxLength: 191,
      customId: 'email',
      type: ComponentType.TextInput
    },
    {
      label: 'Nome de Usuário',
      placeholder: 'Ex: Ashu11-a',
      style: 1,
      minLength: 4,
      maxLength: 30,
      customId: 'username',
      type: ComponentType.TextInput
    },
    {
      label: 'Primeiro Nome',
      placeholder: 'Será usado para registrar os pagamentos!',
      style: 1,
      maxLength: 30,
      customId: 'primeiro-nome',
      type: ComponentType.TextInput
    },
    {
      label: 'Último Nome',
      placeholder: 'Será usado para registrar os pagamentos!',
      style: 1,
      maxLength: 30,
      customId: 'ultimo-nome',
      type: ComponentType.TextInput
    }
  ],
  CtrlPanel: [
    {
      label: 'Email para acesso ao Painel',
      placeholder: 'Ex: Ashu11-a@gmail.com',
      style: 1,
      maxLength: 191,
      customId: 'email',
      type: ComponentType.TextInput
    },
    {
      label: 'Nome de Usuário',
      placeholder: 'Ex: Ashu11-a',
      style: 1,
      minLength: 4,
      maxLength: 30,
      customId: 'username',
      type: ComponentType.TextInput
    }
  ]
}

export function getModalData (key: string): TextInputComponentData[] {
  return modalData[key]
}
