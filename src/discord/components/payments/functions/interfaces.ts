import { type APIEmbed } from 'discord.js'
import { type PreferenceItem, type PreferencePayer, type PreferencePaymentMethods } from 'mercadopago/models/preferences/create-payload.model'

export interface cardData {
  UUID?: string
  product?: string
  amount?: number
  coins?: number
  quantity?: number
  typeEmbed?: number
  typeRedeem?: number
  properties?: any
  user?: User
  cupom?: {
    name?: string
    porcent?: number
    cupomAmount?: number
  }
  fields?: Array<{ value: string }>
}

export interface productData {
  id: string
  role: string
  embed: APIEmbed
  status: boolean
  price?: number
  coins?: number
  properties: any
}

export interface User {
  id: number
  name: string
  email: string
  pterodactylId: number
}

export interface MercadoPago {
  items: PreferenceItem[] | undefined
  payer: PreferencePayer | undefined
  payment_methods: PreferencePaymentMethods | undefined
  notification_url: string | undefined
  metadata: {
    userId: string
    guildId: string
    messageId: string
    price: number
    UUID: string | undefined
  }
  date_of_expiration: string | undefined
}
