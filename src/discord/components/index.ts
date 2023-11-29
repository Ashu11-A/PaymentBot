// Isso ira pegar todos os eventos que um botão é precionado e ira destrinjar ele para os seus reais ações
import { core } from '@/app'
import { Discord } from '@/functions'
import { Event } from '../base'
import { ButtonController } from './controller'

const getInfos = (customId: string): string[] | null[] => {
  const parts = customId.split('_')
  if (parts.length === 4) {
    return [parts[0], parts[1], parts[2], parts[3]]
  }
  return [null, null, null, null]
}

new Event({
  name: 'interactionCreate',
  async run (interaction) {
    if (!interaction.isButton() && !interaction.isAnySelectMenu() && !interaction.isModalSubmit()) return
    const start = Date.now() // Mostrar delay
    const { customId, user: { username } } = interaction
    const typeAction = interaction.isButton() ? 'Buttom' : interaction.isModalSubmit() ? 'Modal' : 'Select'
    const [id, permission, type, action] = getInfos(customId)

    if (action === null) return
    if (permission !== 'User') if (await Discord.Permission(interaction, 'Administrator', 'noPermission')) return
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
        break
      }
      case 'Event': {
        await Controller.event()
        break
      }
    }
    const end = Date.now()
    const timeSpent = (end - start) / 1000 + 's'
    core.info(`${username} | Id: ${id} | Permission: ${permission} | Type: ${type} | typeAction: ${typeAction} | Action: ${action}`)
    core.info(`${type} | ${action} | ${timeSpent}`)
  }
})
