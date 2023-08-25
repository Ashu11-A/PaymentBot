import components from "@/events/main/components";
import { Command } from "@/structs/types/Command";
import { ApplicationCommandType, ActionRowBuilder, ButtonBuilder, ButtonStyle, Collection } from "discord.js";

export default new Command({
    name: "exemple",
    description: "Responde com o ping do Bot",
    type: ApplicationCommandType.ChatInput,
    run({ interaction, client }) {

        const apiLatency = client.ws.ping
        const botLatency = Date.now() - interaction.createdTimestamp

        const row = new ActionRowBuilder<ButtonBuilder>({
            components: [
                new ButtonBuilder({customId: "test", label: "Click Aqui!", style: ButtonStyle.Success})
            ]
        })

        interaction.reply({
            ephemeral: true,
            content: `Latencia da API: ${apiLatency} \nLatencia do Bot: ${botLatency}`,
            components: [row]
        })
    },
    buttons: new Collection([
        ["test", async (interaction:any) => {

            interaction.update({ components: [] })

        }]
    ]),
    modals: new Collection([
        ["yeye",async (interaction:any) => {
            // exemplo
        }]
    ])
})