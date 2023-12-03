import { type StringSelectMenuInteraction, type CacheType } from 'discord.js'
import { TicketButtons } from './buttonsFunctions'
import { db } from '@/app'
import { ticketButtonsConfig } from './ticketUpdateConfig'

interface TicketType {
  interaction: StringSelectMenuInteraction<CacheType>
}
export class TicketSelects implements TicketType {
  interaction
  constructor ({ interaction }: TicketType) {
    this.interaction = interaction
  }

  /**
   * Abre os tickets por meio do menu Select
   */
  public async Product (): Promise<void> {
    const { values, guildId } = this.interaction
    const [posição, channelId, messageID] = values[0].split('_')
    const { select: infos } = await db.messages.get(`${guildId}.ticket.${channelId}.messages.${messageID}`)
    const ticketConstructor = new TicketButtons({ interaction: this.interaction })

    if (Number(posição) >= 0 && Number(posição) < infos.length) {
      const { title, description } = infos[Number(posição)]
      await ticketConstructor.createTicket({ about: title + '\n' + description })
    } else {
      console.log('Posição inválida no banco de dados.')
      await this.interaction.editReply({ content: '❌ | As informações do Banco de dados estão desatualizadas' })
    }
  }

  /**
   * Debug
   */
  public async Debug (): Promise<void> {
    const { guildId, channelId, message } = this.interaction
    const { select: values } = await db.messages.get(`${guildId}.ticket.${channelId}.messages.${message?.id}`)

    if (Array.isArray(values)) {
      const deleteValues = this.interaction.values.map(Number)
      const updatedValues = values.filter((_: string, index: number) => !deleteValues.includes(index))

      await db.messages.set(`${guildId}.ticket.${channelId}.messages.${message?.id}.select`, updatedValues)
      await this.interaction.editReply({
        content: '✅ Valores removidos com sucesso!'
      })
      await ticketButtonsConfig(this.interaction, message)
    } else {
      console.error('Values is not an array. Handle this case appropriately.')
    }
  }
}
