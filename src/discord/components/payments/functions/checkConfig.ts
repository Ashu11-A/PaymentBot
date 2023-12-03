import { type ButtonInteraction, type CacheType, type CommandInteraction } from 'discord.js'
import { type productData } from './interfaces'
import { db } from '@/app'

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class Check {
  /**
    * Verificar se as informações do produto estão coerentes antes de continuar
    */
  public static async product (options: {
    interaction: ButtonInteraction<CacheType> | CommandInteraction<CacheType>
    productData: productData
  }): Promise<[boolean, string] | [boolean]> {
    const { interaction, productData } = options
    const { guildId } = interaction
    const errors: string[] = []

    if (productData !== undefined) {
      if (productData.properties?.SetCtrlPanel === undefined && productData.properties?.SetEstoque === undefined) {
        errors.push('Nenhum método de envio foi configurado.')
      }

      if (productData.properties?.SetCtrlPanel) {
        const ctrlPanelData = await db.payments.get(`${guildId}.config.ctrlPanel`)

        if (productData.coins === undefined) {
          errors.push('Método de envio é `CtrlPanel`, mas não foi setado as moedas a serem adquiridas.')
        }

        if (ctrlPanelData?.token === undefined && ctrlPanelData?.url === undefined) {
          errors.push('Propriedades do ctrlPanel não configurados, use o comando: /config ctrlpanel')
        }
      }

      if (productData.price === undefined) {
        errors.push('Preço do produto não foi configurado')
      }
    } else {
      errors.push('Um erro muito grave ocorreu, nenhum dado foi encontrado no database')
    }

    return errors.length === 0 ? [true] : [false, errors.map(error => `> ${error}`).join('\n')]
  }
}
