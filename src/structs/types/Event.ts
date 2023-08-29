import { type ClientEvents } from 'discord.js'

export interface EventType<Key extends keyof ClientEvents> {
  name: Key
  once?: boolean
  run: (...args: ClientEvents[Key]) => any
}

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class Event<Key extends keyof ClientEvents> {
  constructor (options: EventType<Key>) {
    Object.assign(this, options)
  }
}
