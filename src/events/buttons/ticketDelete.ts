import { Event } from '@/structs/types/Event'
import { ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder } from 'discord.js'
import { createRow } from '@/utils/Discord'
export default new Event({
  name: 'interactionCreate',
  async run (interaction) {
    if (interaction.isButton()) {
      if (interaction.customId === 'del-ticket') {
        await interaction.deferReply({ ephemeral: true })
        const message = await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setDescription('Tem certeza que deseja fechar o Ticket?')
              .setColor('Gold')
          ],
          components: [createRow(
            new ButtonBuilder({ custom_id: 'embed-confirm-button', label: 'Confirmar', style: ButtonStyle.Success }),
            new ButtonBuilder({ custom_id: 'embed-cancel-button', label: 'Cancelar', style: ButtonStyle.Danger })
          )]
        })
        const collector = message.createMessageComponentCollector({ componentType: ComponentType.Button })
        collector.on('collect', async (subInteraction: any) => {
          collector.stop()
          const clearData = { components: [], embeds: [] }

          if (subInteraction.customId === 'embed-cancel-button') {
            await subInteraction.update({
              ...clearData,
              embeds: [
                new EmbedBuilder()
                  .setDescription('Você cancelou a ação')
                  .setColor('Green')
              ]
            })
          } else if (subInteraction.customId === 'embed-confirm-button') {
            await subInteraction.update({
              ...clearData,
              embeds: [
                new EmbedBuilder()
                  .setTitle(`👋 | Olá ${interaction.user.username}`)
                  .setDescription('❗️ | Esse ticket será excluído em 5 segundos.')
                  .setColor('Red')
              ]
            })
            setTimeout(() => {
              subInteraction?.channel?.delete().catch(console.error)
            }, 5000)
          }
        })
      }
    }
  }
})
