import { type AnySelectMenuInteraction, type ButtonInteraction, type CacheType, type ModalSubmitInteraction } from 'discord.js'
import { productCollectorButtons } from './payments/product/productCollectorButtons'
import { productCollectorModal } from './payments/product/productCollectorModal'
import { collectorEditButtons } from './SUEE/collectorButtons'
import { collectorEditModal } from './SUEE/collectorModal'

const cartModals = {
  Direct: {
    modal: true,
    title: '❓| Qual é o seu email cadastrado no Dash?',
    label: 'Seu E-mail',
    style: 1,
    type: 'email'
  },
  Cupom: {
    modal: true,
    title: '❓| Qual cupom deseja utilizar?',
    label: 'Seu Cupom',
    style: 1,
    type: 'cupom.name'
  }
}

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

  static async product ({ interaction, key }: ControllerType): Promise<void> {
    if (interaction.isButton()) await productCollectorButtons({ interaction, key })
    if (interaction.isModalSubmit()) await productCollectorModal({ interaction, key })
  }

  static async SSUE ({ interaction, key }: ControllerType): Promise<void> {
    if (interaction.isButton()) await collectorEditButtons({ interaction, key })
    if (interaction.isModalSubmit()) await collectorEditModal({ interaction, key })
  }
}
