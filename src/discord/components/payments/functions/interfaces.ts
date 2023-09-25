export interface Data {
  product?: string
  amount?: number
  creditos?: number
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
