import { type productData } from './interfaces'

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class Check {
  /**
    * Verificar se as informações do produto estão coerentes antes de continuar
    */
  public static async product (options: {
    productData: productData
  }): Promise<[boolean, string] | [boolean]> {
    const { productData } = options
    const errors: string[] = []

    if (productData !== undefined) {
      if (productData?.properties?.paymentSetCtrlPanel === undefined && productData?.properties?.paymentSetEstoque === undefined) {
        errors.push('Nenhum método de envio foi configurado.')
      }

      if (productData?.properties?.paymentSetCtrlPanel === true && productData?.coins === undefined) {
        errors.push('Método de envio é `CtrlPanel`, mas não foi setado as moedas a serem adquiridas.')
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
