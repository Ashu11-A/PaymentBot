import { type AnySelectMenuInteraction, type ButtonInteraction, type CacheType, type ModalSubmitInteraction } from 'discord.js'
import { collectorEditButtons } from './SUEE/collectorButtons'
import { collectorEditModal } from './SUEE/collectorModal'
import cartCollectorButtons from './payments/cart/cartCollectorButtons'
import cartCollectorModal from './payments/cart/cartCollectorModal'
import { productCollectorButtons } from './payments/product/productCollectorButtons'
import { productCollectorModal } from './payments/product/productCollectorModal'
import eventCollectorButtons from './events/eventCollectorButtons'
import { systemCollectorButtons } from './system/systemCollectorButtons'
import ticketCollectorButtons from './tickets/collectorButtons'
import { ticketCollectorSelect } from './tickets/collectorSelect'
import { ticketCollectorModal } from './tickets/collectorModal'
import configCollectorButtons from './config/configCollectorButtons'

interface ControllerType {
  interaction: ButtonInteraction<CacheType> | ModalSubmitInteraction<CacheType> | AnySelectMenuInteraction<CacheType>
  key: string
}
export class ButtonController implements ControllerType {
  public readonly interaction
  public readonly key

  constructor ({ interaction, key }: ControllerType) {
    this.interaction = interaction
    this.key = key
  }

  async product (): Promise<void> {
    const { interaction, key } = this

    if (interaction.isButton()) { await productCollectorButtons({ interaction, key }); return }
    if (interaction.isModalSubmit()) await productCollectorModal({ interaction, key })
  }

  async SUEE (): Promise<void> {
    const { interaction, key } = this

    if (interaction.isButton()) { await collectorEditButtons({ interaction, key }); return }
    if (interaction.isModalSubmit()) await collectorEditModal({ interaction, key })
  }

  async cart (): Promise<void> {
    const { interaction, key } = this

    if (interaction.isButton()) { await cartCollectorButtons({ interaction, key }); return }
    if (interaction.isModalSubmit()) await cartCollectorModal({ interaction, key })
  }

  async event (): Promise<void> {
    const { interaction, key } = this

    if (interaction.isButton()) await eventCollectorButtons({ interaction, key })
  }

  async system (): Promise<void> {
    const { interaction, key } = this

    if (interaction.isButton()) await systemCollectorButtons({ interaction, key })
  }

  async ticket (): Promise<void> {
    const { interaction, key } = this

    if (interaction.isButton()) { await ticketCollectorButtons({ interaction, key }); return }
    if (interaction.isModalSubmit()) { await ticketCollectorModal({ interaction, key }); return }
    if (interaction.isStringSelectMenu()) { await ticketCollectorSelect({ interaction, key }) }
  }

  async config (): Promise<void> {
    const { interaction, key } = this
    if (interaction.isModalSubmit()) { await configCollectorButtons({ interaction, key }) }
  }
}
