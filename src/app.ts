import { ExtendedClient } from '@/structs/ExtendedClient'
import config from 'config.json'
import Loggings from './controllers/Loggings'
import { color } from '@/structs/types/Colors'
import { LogsDiscord } from './utils/LogsDiscord'
import { QuickDB } from 'quick.db'
import fs from 'fs'
import { join } from 'path'
export * from 'colors'
const client = new ExtendedClient()
const core = new Loggings('All', 'blue')

client.start()

const rootDir = process.cwd()

if (!fs.existsSync(`${rootDir}/database`)) {
  fs.mkdirSync(`${rootDir}/database`)
}

const db = {
  guilds: new QuickDB<any>({ filePath: join(rootDir, 'database/guilds.sqlite'), table: 'guilds' }),
  token: new QuickDB<any>({ filePath: join(rootDir, 'database/token.sqlite'), table: 'token' })
}

export { client, config, color, core, LogsDiscord, db }
