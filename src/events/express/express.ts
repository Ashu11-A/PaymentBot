import { Event } from "@/structs/types/Event";
import Express from "./server/index"
import { Database } from "simpl.db"
import randomstring from 'randomstring';
import { config } from "@/app";

export default new Event({
  name: "ready",
  once: true,
  run() {
    const db = new Database({
      dataFile: "./Database/token.json",
      encryptionKey: config.Express.encryptionKey
    })

    const pass = randomstring.generate({ length: 128 })
    db.set("token", pass, true)

    Express();
  }
});
