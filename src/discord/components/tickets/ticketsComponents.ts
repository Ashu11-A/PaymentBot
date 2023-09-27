import { Component } from '@/discord/base'
import collectorButtons from './ticketsCollector/collectorButtons'
import collectorModal from './ticketsCollector/collectorModal'
import { deleteSelect, collectorSelect } from './ticketsCollector/collectorSelect'
import { Discord } from '@/functions'

const buttonsModals = {
  ticketSetRole: {
    button: true,
    modal: true,
    title: '❓| ID marcado na criação do Ticket',
    label: 'Coloque um ID, ou digite "VAZIO"',
    placeholder: 'Ex: 379089880887721995',
    style: 1,
    maxLength: 30,
    type: 'role'
  },
  ticketOpen: {
    button: true,
    modal: false
  },
  ticketSelectMenu: {
    button: false,
    modal: true,
    type: 'select'
  },
  ticketAddSelect: {
    button: true,
    modal: false
  },
  'del-ticket': {
    button: true,
    modal: false
  },
  ticketSetSelect: {
    button: true,
    modal: false
  },
  ticketSetButton: {
    button: true,
    modal: false
  },
  ticketSendSave: {
    button: true,
    modal: true,
    title: '❓| ID do channel',
    label: 'Coloque um ID',
    placeholder: 'Ex: 379089880887721995',
    style: 1,
    maxLength: 30,
    type: 'embedChannelID'
  },
  ticketEmbedDelete: {
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
        const start = Date.now()
        await collectorButtons(buttonInteraction, key, value)
        const end = Date.now()
        const timeSpent = (end - start) / 1000 + 's'
        console.log('Botão: ' + key, timeSpent)
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
        const start = Date.now()
        await collectorModal(modalInteraction, key, value)
        const end = Date.now()
        const timeSpent = (end - start) / 1000 + 's'
        console.log('Modal: ' + key, timeSpent)
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
