import { Ticket } from '@/discord/components/tickets'
import { type CacheType, type ModalSubmitInteraction } from 'discord.js'

type CustomIdHandlers = Record<string, () => Promise<void> | void>

export async function ticketCollectorModal (options: {
  interaction: ModalSubmitInteraction<CacheType>
  key: string
}): Promise<void> {
  const { interaction, key } = options
  const ticketConstructor = new Ticket({ interaction })

  const customIdHandlers: CustomIdHandlers = {
    AddSelect: async () => { await ticketConstructor.AddSelect(key) },
    SendSave: async () => { await ticketConstructor.sendSave(key) },
    SetRole: async () => { await ticketConstructor.setConfig(key) }
  }

  const customIdHandler = customIdHandlers[key]

  if (typeof customIdHandler === 'function') {
    if (key !== 'SendSave') await interaction.deferReply({ ephemeral: true })
    await customIdHandler()
  }
}
