import { type CustomIdHandlers } from '@/settings/interfaces/Collector'
import { type ButtonInteraction, type CacheType } from 'discord.js'
import { showModal } from './functions/showModal'

export default async function accountCollectorButtons (options: {
  interaction: ButtonInteraction<CacheType>
  key: string
}): Promise<void> {
  const { interaction, key } = options
  if (!interaction.inGuild()) return

  const customIdHandlers: CustomIdHandlers = {
    Pterodactyl: async () => { await showModal({ interaction, key }) },
    CtrlPanel: async () => { await showModal({ interaction, key }) }
  }

  const customIdHandler = customIdHandlers[key]

  if (typeof customIdHandler === 'function') {
    await customIdHandler()
  }
}
