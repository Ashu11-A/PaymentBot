import { Component } from '@/discord/base'
import { Database, Discord } from '@/functions'
import { setPresence, delModalPresence } from './configCollector/Presence'

const system = {
  Ticket: { info: 'Tickets' },
  Payments: { info: 'Pagamentos' },
  Welcomer: { info: 'Boas vindas' },
  Status: { info: 'Status' },
  DeleteServers: { info: 'Deletar Servidores' },
  TelegramNotif: { info: 'Notificação via Telegram' },
  StatusMinecraft: { info: 'Status', remove: 'systemStatusString' },
  StatusString: { info: 'Status', remove: 'systemStatusMinecraft' },
  Logs: { info: 'Logs' },
  StatusOnline: { type: 'systemStatusType', info: 'online' },
  StatusAusente: { type: 'systemStatusType', info: 'idle' },
  StatusNoPerturbe: { type: 'systemStatusType', info: 'dnd' },
  StatusInvisível: { type: 'systemStatusType', info: 'invisible' }
}

Object.entries(system).map(async ([key, value]) => {
  await Discord.registerComponent({
    customId: key,
    type: 'Button',
    async run (buttonInteraction) {
      await buttonInteraction.deferReply({ ephemeral })
      if ('type' in value) {
        await Database.setDelete({
          interaction: buttonInteraction,
          systemName: value.type,
          pathDB: 'status',
          displayName: key,
          typeDB: 'system',
          enabledType: value.info
        })
      } else if ('remove' in value) {
        await Database.setDelete({
          interaction: buttonInteraction,
          systemName: key,
          pathDB: 'status',
          displayName: value.info,
          typeDB: 'system',
          enabledType: 'swap',
          otherSystemNames: [value.remove]
        })
      } else {
        await Database.setDelete({
          interaction: buttonInteraction,
          systemName: key,
          pathDB: 'status',
          displayName: value.info,
          typeDB: 'system',
          enabledType: 'switch'
        })
      }
    }
  })
})

new Component({
  customId: 'MessagePresence',
  type: 'Modal',
  async run (modalInteraction) {
    await setPresence(modalInteraction)
  }
})

new Component({
  customId: 'messagesStatusArray',
  type: 'StringSelect',
  async run (selectInteraction) {
    await delModalPresence(selectInteraction)
  }
})
