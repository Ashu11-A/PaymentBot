import { createClient } from './discord/base'
import { log } from './settings'
import Loggings from '@/controllers/Loggings'
import { dirCR } from '@/functions'
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
  guilds: new QuickDB({ filePath: join(rootDir, 'database/guilds.sqlite'), table: 'guilds' }),
  payments: new QuickDB({ filePath: join(rootDir, 'database/guilds.sqlite'), table: 'payments' }),
  messages: new QuickDB({ filePath: join(rootDir, 'database/guilds.sqlite'), table: 'messages' }),
  staff: new QuickDB({ filePath: join(rootDir, 'database/guilds.sqlite'), table: 'staff' }),
  system: new QuickDB({ filePath: join(rootDir, 'database/guilds.sqlite'), table: 'system' }),
  tokens: new QuickDB({ filePath: join(rootDir, 'database/tokens.sqlite'), table: 'tokens' }),
  ctrlPanel: new QuickDB({ filePath: join(rootDir, 'database/ctrlPanel.sqlite') })
}

export { client, core, db }
