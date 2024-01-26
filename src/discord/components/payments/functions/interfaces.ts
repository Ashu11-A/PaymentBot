import { type EmbedType, type EmbedFooterData, type EmbedAssetData, type APIEmbedProvider, type EmbedAuthorData, type APIEmbedField } from 'discord.js'
import { type PreferenceItem, type PreferencePayer, type PreferencePaymentMethods } from 'mercadopago/models/preferences/create-payload.model'

export interface ProductCartData {
  id: string
  name?: string
  amount: number
  quantity: number
  coins?: number
  messageId?: string
  cupom?: {
    name: string
    porcent: number
  }
  pterodactyl?: {
    cpu: string
    ram: string
    disk: string
    port: string
  }
}

export interface cartData {
  UUID?: string
  channelId?: string
  products: ProductCartData[]
  messageId?: string
  typeEmbed: number
  typeRedeem?: number
  role?: string
  paymentId?: number
  user?: User
  properties?: Record<string, boolean> | undefined
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
  pterodactyl?: {
    cpu: string
    ram: string
    disk: string
    port: string
  }
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

export interface infoPayment {
  userName: string
  userId: string
  guildId: string | null
  channelId: string
  price?: number
  UUID: string
  mpToken?: string
  method?: 'debit_card' | 'credit_card'
  ipn?: string
}

export interface MercadoPago {
  items: PreferenceItem[] | undefined
  payer: PreferencePayer | undefined
  payment_methods: PreferencePaymentMethods | undefined
  notification_url: string | undefined
  metadata: infoPayment
  date_of_expiration: string | undefined
}
