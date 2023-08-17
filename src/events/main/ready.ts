import { client } from "@/app";
import { Event } from "@/structs/types/Event";

export default new Event({
    name: "ready",
    once: true,
    run() {
        
        const { commands, buttons, selects, modals } = client

        console.log("✅ Bot online".green)
        console.log(`✅ Commands carregados: ${commands.size}`.cyan)
        console.log(`✅ Buttons carregados: ${buttons.size}`.cyan)
        console.log(`✅ Selects carregados: ${selects.size}`.cyan)
        console.log(`✅ Moldals carregados: ${modals.size}`.cyan)
        
    },
})