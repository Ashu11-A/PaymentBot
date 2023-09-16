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

  public async start (): Promise<void> {
    await this.registerModules()
    await this.registerEvents()
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

  private async registerModules (): Promise<void> {
    const slashCommands = new Array<ApplicationCommandDataResolvable>()

    const commandsPath = path.join(__dirname, '..', 'commands')

    const localPath = fs.readdirSync(commandsPath)
    for (const local of localPath) {
      const files = fs.readdirSync(commandsPath + `/${local}/`).filter(fileCondition)
      for (const fileName of files) {
        const command: CommandType = (await import(`../commands/${local}/${fileName}`))?.default
        const { name, buttons, selects, modals } = command

        if (name !== undefined) {
          this.commands.set(name, command)
          slashCommands.push(command)

          if (buttons !== undefined) buttons.forEach((run, key) => this.buttons.set(key, run))
          if (selects !== undefined) selects.forEach((run, key) => this.selects.set(key, run))
          if (modals !== undefined) modals.forEach((run, key) => this.modals.set(key, run))
        }
      }
    }
    this.on('ready', () => { this.registerCommands(slashCommands) })
  }

  private async registerEvents (): Promise<void> {
    const eventsPath = path.join(__dirname, '..', 'events')

    const filesPath = fs.readdirSync(eventsPath)
    for (const local of filesPath) {
      const files = fs.readdirSync(`${eventsPath}/${local}`).filter(fileCondition)
      for (const fileName of files) {
        const { name, once, run }: EventType<keyof ClientEvents> = (await import(`../events/${local}/${fileName}`))?.default

        try {
          if (name !== undefined) (once !== undefined) ? this.once(name, run) : this.on(name, run)
        } catch (error: any) {
          core.error(`Ocorreu um erro no evento: ${name} \n${error}`.red)
        }
      }
    }
  }
}
