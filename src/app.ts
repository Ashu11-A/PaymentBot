import { ExtendedClient } from '@/structs/ExtendedClient'
import config from 'config.json'
import Loggings from './controllers/Loggings'
import { color } from '@/structs/types/Colors'
import { LogsDiscord } from './utils/LogsDiscord'
export * from 'colors'
const client = new ExtendedClient()
const core = new Loggings('All', 'blue')

client.start()

export { client, config, color, core, LogsDiscord }
