import { type CustomIdHandlers } from '@/interfaces'
import { type CacheType, type StringSelectMenuInteraction } from 'discord.js'
import { ProductSeletc } from './functions/selectCollector'

export async function productCollectorSelect (options: {
  interaction: StringSelectMenuInteraction<CacheType>
  key: string
}): Promise<void> {
  const { interaction, key } = options
  const { message } = interaction
  const product = new ProductSeletc({ interaction, message })

  const customIdHandlers: CustomIdHandlers = {
    NestSelect: async () => { await product.EggSelect() },
    EggSelect: async () => { await product.EggSave() }
  }

  const customIdHandler = customIdHandlers[key]

  if (typeof customIdHandler === 'function') {
    await interaction.deferReply({ ephemeral })
    await customIdHandler()
  }
}
