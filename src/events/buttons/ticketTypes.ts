import { db } from '@/app'
import { buttonsConfig } from '@/commands/tickets/utils/ticketUpdateConfig'
import { Event } from '@/structs/types/Event'
import { ActionRowBuilder, ModalBuilder, TextInputBuilder } from 'discord.js'

const listItens = {
  SetName: {
    label: '❓| Qual será o Título?',
    placeholder: 'Ex: Parceria',
    style: 1,
    maxLength: 256,
    type: 'title'
  },
  SetDesc: {
    label: '❓| Qual será a Descrição?',
    placeholder: 'Ex: Quero me tornar um parceiro.',
    style: 1,
    maxLength: 256,
    type: 'description'
  }
}

export default new Event({
  name: 'interactionCreate',
  async run (interaction) {
    if (interaction.isButton()) {
      const { customId } = interaction
      if (customId === 'ticketSetSelect' || customId === 'ticketSetButton') {
        const { guildId, channelId, message } = interaction
        if (customId === 'ticketSetSelect') {
          await db.guilds.set(`${guildId}.ticket.${channelId}.messages.${message.id}.properties.ticketSetSelect`, true)
          await db.guilds.set(`${guildId}.ticket.${channelId}.messages.${message.id}.properties.ticketSetButton`, false)
        } else {
          await db.guilds.set(`${guildId}.ticket.${channelId}.messages.${message.id}.properties.ticketSetButton`, true)
          await db.guilds.set(`${guildId}.ticket.${channelId}.messages.${message.id}.properties.ticketSetSelect`, false)
        }
        await interaction.reply({ content: '⏱️ | Aguarde só um pouco...', ephemeral: true })
        await buttonsConfig(interaction, message)
      } else if (customId === 'ticketAddSelect') {
        const modal = new ModalBuilder({ customId: 'ticketSelectMenu', title: 'Adicionar Opções no Select Menu' })
        Object.entries(listItens).map(async ([, value]) => {
          const { label, placeholder, style, type, maxLength } = value
          if ((interaction?.memberPermissions?.has('Administrator')) === false) {
            await interaction.reply({
              content: '**❌ - Você não possui permissão para utilizar este botão!**',
              ephemeral: true
            })
            return
          }
          const content = new ActionRowBuilder<TextInputBuilder>({
            components: [
              new TextInputBuilder({
                custom_id: type,
                label,
                placeholder,
                style,
                required: true,
                maxLength
              })
            ]
          })
          modal.addComponents(content)
        })
        await interaction.showModal(modal)
      }
    }
  }
})
