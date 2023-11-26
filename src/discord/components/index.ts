// Isso ira pegar todos os eventos que um botão é precionado e ira destrinjar ele para os seus reais ações
import { core } from '@/app'
import { Event } from '../base'
import { Discord } from '@/functions'

const getInfos = (customId: string): string[] | null[] => {
  const parts = customId.split('_')
  if (parts.length > 0) {
    return [parts[0], parts[1], parts[2], parts[3]]
  }
  return [null, null, null]
}

new Event({
  name: 'interactionCreate',
  async run (interaction) {
    if (!interaction.isButton()) return
    const { customId, user: { username } } = interaction
    const [id, type, permission, action] = getInfos(customId)

    if (permission !== 'User') if (await Discord.Permission(interaction, 'Administrator', 'noPermission')) return

    switch (type) {
      case 'Cart': {
        break
      }
      case 'Product': {
        break
      }
      case 'System' : {
        break
      }
    }
    core.info(`${username} | Id: ${id} | Type: ${type} | Permission: ${permission} | Action: ${action}`)
  }
})
