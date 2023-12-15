// Isso ira pegar todos os eventos que um botão é precionado e ira destrinjar ele para os seus reais ações
import { core } from '@/app'
import { CustomButtonBuilder, Discord } from '@/functions'
import { Event } from '../base'
import { ButtonController } from './controller'
import { EmbedBuilder } from 'discord.js'

new Event({
  name: 'interactionCreate',
  async run (interaction) {
    if (!interaction.isButton() && !interaction.isStringSelectMenu() && !interaction.isModalSubmit()) return
    const start = Date.now() // Mostrar delay
    const { customId, user: { username }, guild } = interaction
    const typeAction = interaction.isButton() ? 'Buttom' : interaction.isModalSubmit() ? 'Modal' : 'Select'
    const [id, permission, type, action] = CustomButtonBuilder.getInfos(customId)

    if (id === null || action === null) { console.log('Nenhuma ação foi expecificada no botão'); return }
    // <-- Verifica a interação -->
    if (!(await CustomButtonBuilder.verify({ id, interaction }))) {
      await interaction.reply({
        ephemeral,
        embeds: [
          new EmbedBuilder({
            title: 'O botão ``' + action + '`` está protegido contra interações desconhecidas!'
          }).setColor('Red')
        ]
      })
      core.warn(`Usuário ${username} tentou clicar no botão ${action}, mas ele não tem permição para isso!`)
      await Discord.sendLog({
        interaction,
        guild,
        cause: 'noButtonPermission',
        type: 'warn',
        color: 'Orange',
        infos: [{ type, action }]
      })
      return
    }
    // <-- Verifica a permição -->
    if (permission !== 'User') if (await Discord.Permission(interaction, 'Administrator', 'noPermission')) return
    core.info(`${username} | Id: ${id} | Permission: ${permission} | Type: ${type} | typeAction: ${typeAction} | Action: ${action}`)
    const Controller = new ButtonController({ interaction, key: action })

    switch (type) {
      case 'Product': {
        await Controller.product()
        break
      }
      case 'SUEE': {
        await Controller.SUEE()
        break
      }
      case 'Cart': {
        await Controller.cart()
        break
      }
      case 'System': {
        await Controller.system()
        break
      }
      case 'Ticket': {
        await Controller.ticket()
        break
      }
      case 'Event': {
        await Controller.event()
        break
      }
    }
    const end = Date.now()
    const timeSpent = (end - start) / 1000 + 's'
    core.info(`Button: ${action} | Type: ${type} | ${timeSpent}`)
  }
})
