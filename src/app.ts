import { ExtendedClient } from "@/structs/ExtendedClient"
export * from "colors"
import fs from "fs"
import path from "path"
/* import config from "config.json" */

import { color } from "@/structs/types/Colors"

const client = new ExtendedClient()

client.start()

export { client, color }