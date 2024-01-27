import { type CustomIdHandlers } from '@/settings/interfaces/Collector'
import { type ModalSubmitInteraction, type CacheType } from 'discord.js'
import { createAccount } from './pterodactyl/createAccount'

export default async function accountCollectorModal (options: {
  interaction: ModalSubmitInteraction<CacheType>
  key: string
}): Promise<void> {
  const { interaction, key } = options
  if (!interaction.inGuild()) return

  const customIdHandlers: CustomIdHandlers = {
    Pterodactyl: async () => { await createAccount({ interaction, key }) }
  }

  const customIdHandler = customIdHandlers[key]

  if (typeof customIdHandler === 'function') {
    await customIdHandler()
  }
}
