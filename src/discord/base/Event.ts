import { core } from '@/app'
import ck from 'chalk'
import { type ClientEvents } from 'discord.js'

interface EventData<Key extends keyof ClientEvents> {
  name: Key
  once?: boolean
  // eslint-disable-next-line @typescript-eslint/method-signature-style
  run(...args: ClientEvents[Key]): any
}

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class Event<Key extends keyof ClientEvents> {
  public static all: Array<EventData<keyof ClientEvents>> = []
  constructor (data: EventData<Key>) {
    core.info(ck.green(`${ck.cyan.underline(data.name)} has been successfully registered!`))
    Event.all.push(data)
  }
}
