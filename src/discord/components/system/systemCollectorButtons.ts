import { Database } from '@/functions'
import { type SystemCustomIdHandlers } from '@/settings/interfaces/Collector'
import { type ButtonInteraction, type CacheType } from 'discord.js'

export async function systemCollectorButtons (options: {
  interaction: ButtonInteraction<CacheType>
  key: string
}): Promise<void> {
  const { interaction, key } = options
  await interaction.deferReply({ ephemeral })

  const customIdHandlers: SystemCustomIdHandlers = {
    Ticket: { info: 'Tickets' },
    Payments: { info: 'Pagamentos' },
    Welcomer: { info: 'Boas vindas' },
    Status: { info: 'Status' },
    DeleteServers: { info: 'Deletar Servidores' },
    TelegramNotif: { info: 'Notificação via Telegram' },
    StatusMinecraft: { info: 'Status', remove: 'StatusString' },
    StatusString: { info: 'Status', remove: 'StatusMinecraft' },
    Logs: { info: 'Logs' },
    StatusOnline: { type: 'StatusType', info: 'online' },
    StatusAusente: { type: 'StatusType', info: 'idle' },
    StatusNoPerturbe: { type: 'StatusType', info: 'dnd' },
    StatusInvisível: { type: 'StatusType', info: 'invisible' }
  }

  const customIdHandler = customIdHandlers[key]

  if (typeof customIdHandler === 'object') {
    const commonParams = {
      interaction,
      systemName: key,
      pathDB: 'status',
      displayName: customIdHandler.info
    }

    if (customIdHandler.type !== undefined) {
      await Database.setDelete({
        ...commonParams,
        systemName: customIdHandler.type,
        typeDB: 'system',
        enabledType: customIdHandler.info
      })
    } else if (customIdHandler.remove !== undefined) {
      await Database.setDelete({
        ...commonParams,
        typeDB: 'system',
        enabledType: 'swap',
        otherSystemNames: [customIdHandler.remove]
      })
    } else {
      await Database.setDelete({
        ...commonParams,
        typeDB: 'system',
        enabledType: 'switch'
      })
    }
  }
}

/*

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
*/
