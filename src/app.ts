import { ExtendedClient } from '@/structs/ExtendedClient'
import config from '@/config.json'
import Loggings from '@/controllers/Loggings'
import { color } from '@/structs/types/Colors'
import { LogsDiscord } from '@/utils/LogsDiscord'
import { QuickDB } from 'quick.db'
import { join } from 'path'
import { dirCR } from '@/utils/Folder'
export * from 'colors'
const client = new ExtendedClient()
const core = new Loggings('All', 'blue')

client.start()

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

export { client, config, color, core, LogsDiscord, db }
