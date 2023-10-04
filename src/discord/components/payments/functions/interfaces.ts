import { type PreferenceItem, type PreferencePayer, type PreferencePaymentMethods } from 'mercadopago/models/preferences/create-payload.model'

export interface Data {
  product?: string
  amount?: number
  coins?: number
  quantity?: number
  typeEmbed?: number
  typeRedeem?: number
  properties?: any
  cupom?: {
    name?: string
    porcent?: number
    cupomAmount?: number
  }
  fields?: Array<{ value: string }>
}

export interface User {
  name: string
  email: string
  credits: number
}

export interface MercadoPago {
  items: PreferenceItem[] | undefined
  payer: PreferencePayer | undefined
  payment_methods: PreferencePaymentMethods | undefined
  notification_url: string | undefined
  metadata: {
    user_id: string
    amountTax: number
    mcToken: any
  }
  date_of_expiration: string | undefined
}
