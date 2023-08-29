import { Client, Partials, IntentsBitField, type BitFieldResolvable, type GatewayIntentsString, Collection, type ApplicationCommandDataResolvable, type ClientEvents } from 'discord.js'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { type CommandType, type ComponentsButton, type ComponentsModal, type ComponentsSelect } from './types/Command'
import { type EventType } from './types/Event'
import { core } from '@/app'
dotenv.config()

const fileCondition = (fileName: string): boolean => fileName.endsWith('.ts') || fileName.endsWith('.js')
export class ExtendedClient extends Client {
  public commands = new Collection<string, CommandType>()
  public buttons: ComponentsButton = new Collection()
  public selects: ComponentsSelect = new Collection()
  public modals: ComponentsModal = new Collection()
  constructor () {
    super({
      intents: Object.keys(IntentsBitField.Flags) as BitFieldResolvable<GatewayIntentsString, number>,
      partials: [
        Partials.Channel, Partials.GuildMember, Partials.GuildScheduledEvent,
        Partials.Message, Partials.Reaction, Partials.ThreadMember, Partials.User
      ]
    })
  }

  public start (): void {
    this.registerModules()
    this.registerEvents()
    void this.login(process.env.BOT_TOKEN)
  }

  private registerCommands (commands: ApplicationCommandDataResolvable[]): void {
    this.application?.commands.set(commands)
      .then(() => {
        core.info('✅ Slash Commands (/) definidos'.green)
      })
      .catch(error => {
        core.error(`❌ Um erro ocorreu quando tentava definir os Slash Commands (/): \n${error}`.red)
      })
  }

  private registerModules (): void {
    const slashCommands = new Array<ApplicationCommandDataResolvable>()

    const commandsPath = path.join(__dirname, '..', 'commands')

    fs.readdirSync(commandsPath).forEach(local => {
      fs.readdirSync(commandsPath + `/${local}/`).filter(fileCondition).forEach(async fileName => {
        const command: CommandType = (await import(`../commands/${local}/${fileName}`))?.default
        const { name, buttons, selects, modals } = command

        if (name) {
          this.commands.set(name, command)
          slashCommands.push(command)

          if (buttons) buttons.forEach((run, key) => this.buttons.set(key, run))
          if (selects) selects.forEach((run, key) => this.selects.set(key, run))
          if (modals) modals.forEach((run, key) => this.modals.set(key, run))
        }
      })
    })

    this.on('ready', () => { this.registerCommands(slashCommands) })
  }

  private registerEvents (): void {
    const eventsPath = path.join(__dirname, '..', 'events')

    fs.readdirSync(eventsPath).forEach(local => {
      fs.readdirSync(`${eventsPath}/${local}`).filter(fileCondition)
        .forEach(async fileName => {
          const { name, once, run }: EventType<keyof ClientEvents> = (await import(`../events/${local}/${fileName}`))?.default

          try {
            if (name) (once) ? this.once(name, run) : this.on(name, run)
          } catch (error) {
            core.error(`Ocorreu um erro no evento: ${name} \n${error}`.red)
          }
        })
    })
  }
}
