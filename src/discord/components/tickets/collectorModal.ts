import { TicketModals } from '@/discord/components/tickets'
import { type CustomIdHandlers } from '@/settings/interfaces/Collector'
import { type CacheType, type ModalSubmitInteraction } from 'discord.js'

export async function ticketCollectorModal (options: {
  interaction: ModalSubmitInteraction<CacheType>
  key: string
}): Promise<void> {
  const { interaction, key } = options
  const ticketConstructor = new TicketModals({ interaction })

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
