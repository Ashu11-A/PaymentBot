import { createClient } from './discord/base'
import { log } from './settings'
import Loggings from '@/controllers/Loggings'
import { LogsDiscord, dirCR } from '@/functions'
import { QuickDB } from 'quick.db'
import { join } from 'path'

export * from 'colors'
const core = new Loggings('All', 'blue')

const client = createClient()
client.start()

process.on('uncaughtException', log.error)
process.on('unhandledRejection', log.error)

const rootDir = process.cwd()

dirCR(`${rootDir}/database`)

const db = {
  guilds: new QuickDB<any>({ filePath: join(rootDir, 'database/guilds.sqlite'), table: 'guilds' }),
  payments: new QuickDB<any>({ filePath: join(rootDir, 'database/guilds.sqlite'), table: 'payments' }),
  messages: new QuickDB<any>({ filePath: join(rootDir, 'database/guilds.sqlite'), table: 'messages' }),
  staff: new QuickDB<any>({ filePath: join(rootDir, 'database/guilds.sqlite'), table: 'staff' }),
  system: new QuickDB<any>({ filePath: join(rootDir, 'database/guilds.sqlite'), table: 'system' }),
  tokens: new QuickDB<any>({ filePath: join(rootDir, 'database/tokens.sqlite'), table: 'tokens' })
}

export { client, core, LogsDiscord, db }
