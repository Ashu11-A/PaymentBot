import { ExtendedClient } from "@/structs/ExtendedClient"
export * from "colors"
import config from "config.json"

import { color } from "@/structs/types/Colors"

const client = new ExtendedClient()

client.start()

export { client, config, color }