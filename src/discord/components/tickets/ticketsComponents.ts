import { Component } from '@/discord/base'
import { collectorSelect, deleteSelect } from './collectorSelect'

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
