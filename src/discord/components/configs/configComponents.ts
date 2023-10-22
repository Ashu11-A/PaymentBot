import { Component } from '@/discord/base'
import { Database, Discord } from '@/functions'
import { setPresence, delModalPresence } from './configCollector/Presence'

const system = {
  systemTicket: { info: 'Tickets' },
  systemPayments: { info: 'Pagamentos' },
  systemWelcomer: { info: 'Boas vindas' },
  systemStatus: { info: 'Status' },
  systemDeleteServers: { info: 'Deletar Servidores' },
  systemTelegramNotif: { info: 'Notificação via Telegram' },
  systemStatusMinecraft: { info: 'Status', remove: 'systemStatusString' },
  systemStatusString: { info: 'Status', remove: 'systemStatusMinecraft' },
  systemLogs: { info: 'Logs' },
  systemStatusOnline: { type: 'systemStatusType', info: 'online' },
  systemStatusAusente: { type: 'systemStatusType', info: 'idle' },
  systemStatusNoPerturbe: { type: 'systemStatusType', info: 'dnd' },
  systemStatusInvisível: { type: 'systemStatusType', info: 'invisible' }
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
