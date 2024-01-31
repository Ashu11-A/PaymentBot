import { type TextInputComponentData, type Message } from 'discord.js'

export interface collectorButtonsForModals extends TextInputComponentData {
  title: string
  modal?: boolean
  db?: string
}

export type CustomIdHandlers = Record<string, () => undefined | Promise<void> | Promise<Message<boolean>> >
export type SystemCustomIdHandlers = Record<string, { info: string, remove?: string, type?: string }>
