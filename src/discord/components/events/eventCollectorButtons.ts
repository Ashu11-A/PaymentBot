import { type Message, type ButtonInteraction, type CacheType } from 'discord.js'

type CustomIdHandlers = Record<string, () => Promise<Message<boolean>>>

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
