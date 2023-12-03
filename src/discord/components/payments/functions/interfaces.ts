import { type EmbedType, type EmbedFooterData, type EmbedAssetData, type APIEmbedProvider, type EmbedAuthorData, type APIEmbedField } from 'discord.js'
import { type PreferenceItem, type PreferencePayer, type PreferencePaymentMethods } from 'mercadopago/models/preferences/create-payload.model'

export interface cartData {
  UUID?: string
  role?: string
  product?: string
  amount: number
  coins?: number
  quantity: number
  typeEmbed?: number
  typeRedeem?: number
  paymentId?: number
  properties?: Record<string, boolean> | undefined
  user?: User
  cupom?: {
    name: string
    porcent: number
  }
  fields?: Array<{ value: string }>
}

interface EmbedData {
  title?: string
  type?: EmbedType
  description?: string
  url?: string
  timestamp?: string | number | Date
  color?: number | string
  footer?: EmbedFooterData
  image?: EmbedAssetData
  thumbnail?: EmbedAssetData
  provider?: APIEmbedProvider
  author?: EmbedAuthorData
  fields?: APIEmbedField[]
  video?: EmbedAssetData
}

export interface productData {
  id: string
  role: string
  embed: EmbedData
  status: boolean
  price?: number
  coins?: number
  properties: Record<string, boolean>
}

export interface User {
  id: number
  name: string
  email: string
  pterodactylId: number
  role: string
}

export interface Server {
  userId: number
  pterodactylId: number
  identifier: string
  name: string
  suspended: boolean
  createAt: number
}

export interface MercadoPago {
  items: PreferenceItem[] | undefined
  payer: PreferencePayer | undefined
  payment_methods: PreferencePaymentMethods | undefined
  notification_url: string | undefined
  metadata: {
    userId: string
    price: number
    infoPayment: any[]
  }
  date_of_expiration: string | undefined
}
