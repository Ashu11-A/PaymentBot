import { Component } from '@/discord/base'
import collectorButtons from './ticketsCollector/collectorButtons'
import collectorModal from './ticketsCollector/collectorModal'
import { deleteSelect, collectorSelect } from './ticketsCollector/collectorSelect'
import { Discord } from '@/functions'

const buttonsModals = {
  SetRole: {
    button: true,
    modal: true,
    title: '❓| ID marcado na criação do Ticket',
    label: 'Coloque um ID, ou digite "VAZIO"',
    placeholder: 'Ex: 379089880887721995',
    style: 1,
    maxLength: 30,
    type: 'role'
  },
  Open: {
    button: true,
    modal: false
  },
  SelectMenu: {
    button: false,
    modal: true,
    type: 'select'
  },
  AddSelect: {
    button: true,
    modal: false
  },
  'del-ticket': {
    button: true,
    modal: false
  },
  SetSelect: {
    button: true,
    modal: false
  },
  SetButton: {
    button: true,
    modal: false
  },
  SendSave: {
    button: true,
    modal: true,
    title: '❓| ID do channel',
    label: 'Coloque um ID',
    placeholder: 'Ex: 379089880887721995',
    style: 1,
    maxLength: 30,
    type: 'embedChannelID'
  },
  EmbedDelete: {
    button: true,
    modal: false
  }
}

Object.entries(buttonsModals).map(async ([key, value]) => {
  await Discord.registerComponent({
    customId: key,
    type: 'Button',
    async run (buttonInteraction) {
      if (value.button || !value.modal) {
        await collectorButtons(buttonInteraction, key, value)
      }
    }
  })
})

Object.entries(buttonsModals).map(async ([key, value]) => {
  await Discord.registerComponent({
    customId: key,
    type: 'Modal',
    async run (modalInteraction) {
      if (!value.button || value.modal) {
        await collectorModal(modalInteraction, key, value)
      }
    }
  })
})

new Component({
  customId: 'ticketRowSelect',
  type: 'StringSelect',
  async run (selectInteraction) {
    await deleteSelect(selectInteraction)
  }
})

new Component({
  customId: 'ticketRowSelectProduction',
  type: 'StringSelect',
  async run (selectInteraction) {
    await collectorSelect(selectInteraction)
  }
})
