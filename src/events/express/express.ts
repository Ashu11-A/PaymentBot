import { Event } from "@/structs/types/Event";
import Express from "./server/index"

export default new Event({
  name: "ready",
  once: true,
  run() {
    Express();
  }
});
