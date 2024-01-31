import { type CustomIdHandlers } from '@/interfaces'
import { type CacheType, type StringSelectMenuInteraction } from 'discord.js'
import { TicketSelects } from './functions/selectsFunction'

export async function ticketCollectorSelect (options: {
  interaction: StringSelectMenuInteraction<CacheType>
  key: string
}): Promise<void> {
  const { interaction, key } = options
  console.log(key)
  const ticketConstructor = new TicketSelects({ interaction })

  const customIdHandlers: CustomIdHandlers = {
    RowSelect: async () => { await ticketConstructor.Debug() },
    RowSelectProduction: async () => { await ticketConstructor.Product() }
  }

  const customIdHandler = customIdHandlers[key]

  if (typeof customIdHandler === 'function') {
    await interaction.deferReply({ ephemeral })
    await customIdHandler()
  }
}
