import { type CustomIdHandlers } from '@/interfaces'
import { type ButtonInteraction, type CacheType } from 'discord.js'

export default async function eventCollectorButtons (options: {
  interaction: ButtonInteraction<CacheType>
  key: string
}): Promise<void> {
  const { interaction, key } = options
  if (!interaction.inGuild()) return

  const customIdHandlers: CustomIdHandlers = {
    deleteMSG: async () => await interaction.message.delete()
  }

  const customIdHandler = customIdHandlers[key]

  if (typeof customIdHandler === 'function') {
    await customIdHandler()
  }
}
