import { db } from '@/app'
import axios from 'axios'
import { type StringSelectMenuInteraction, type CacheType, ActionRowBuilder, type SelectMenuComponentOptionData, StringSelectMenuBuilder, Message } from 'discord.js'
import { ProductButtonCollector } from './buttonsCollector'
import { TextChannel } from 'discord.js'
import { UpdateProduct } from './updateProduct'

interface ProductSeletcType {
  interaction: StringSelectMenuInteraction<CacheType>
  message: Message<boolean>
}
export class ProductSeletc implements ProductSeletcType {
  interaction
  message
  constructor ({ interaction, message }: ProductSeletcType) {
    this.interaction = interaction
    this.message = message
  }

  /**
    * Selecionar Egg
    */
  public async EggSelect (): Promise<void> {
    const { interaction, message } = this

    const { values, guildId } = interaction

    const [nestId, messageId] = values[0].split('-')
    console.log(nestId, messageId)

    const { url: urlPtero, tokenPanel: tokenPtero } = (await db.payments.get(
      `${guildId}.config.pterodactyl`
    )) ?? { url: undefined, tokenPanel: undefined }

    await axios({
      url: `${urlPtero}/api/application/nests/${nestId}/eggs`,
      method: 'GET',
      maxRedirects: 5,
      headers: {
        Accept: 'Application/vnd.pterodactyl.v1+json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenPtero}`
      }
    })
      .then(async (EggsData) => {
        const { data } = EggsData.data as { data: any[] }
        const options: SelectMenuComponentOptionData[] = []

        options.push({
          value: `back-${messageId}`,
          description: 'Voltar',
          label: '...'
        })

        for (const [position, nest] of data.entries()) {
          if (position >= 24) continue
          const { name, id, uuid, description } = nest.attributes as { name: string, id: number, uuid: string, description: string }
          console.log(name, id, uuid)
          options.push({
            value: `${id}-${name.replace('-', ' ')}-${nestId}-${messageId}`,
            description: ((description?.length >= 50) ? (description.substring(0, 50) + '...') : description ?? uuid),
            label: name
          })
        }

        const row = new ActionRowBuilder<StringSelectMenuBuilder>({
          components: [
            new StringSelectMenuBuilder({
              custom_id: '-1_Admin_Product_EggSelect',
              placeholder: 'Selecione o Egg',
              minValues: 1,
              maxValues: 1,
              options
            })
          ]
        })
        await message.edit({ components: [row] })
        await interaction.deleteReply()
      })
  }

  /**
    * name
    */
  public async EggSave (): Promise<void> {
    const { interaction, message } = this
    const { values, guildId, channelId } = interaction

    const { url: urlPtero, tokenPanel: tokenPtero } = (await db.payments.get(
      `${guildId}.config.pterodactyl`
    )) ?? { url: undefined, tokenPanel: undefined }
    console.log(urlPtero, tokenPtero)

    const [eggId, eggName, nestId, messageId] = values[0].split('-')

    if (eggId !== 'back') {
      console.log(eggId, eggName, nestId, messageId)
      await db.messages.set(`${guildId}.payments.${channelId}.messages.${messageId}.pterodactyl.egg`, {
        name: eggName,
        nestId: Number(nestId),
        eggId: Number(eggId)
      })

      await db.messages.set(`${guildId}.payments.${channelId}.messages.${messageId}.properties.Egg`, true)

      const channelGet = await interaction.guild?.channels.fetch(channelId)
      if (channelGet instanceof TextChannel) {
        const messageGet = await channelGet?.messages.fetch(messageId).catch((err) => { console.log(err) })
        if (messageGet instanceof Message) {
          const product = new UpdateProduct({ interaction, message: messageGet })
          await product.embed({ button: 'Egg' })
          await message.delete()
          await interaction.deleteReply()
        }
      }
    } else {
      const ProductButton = new ProductButtonCollector({ interaction, message })
      await ProductButton.NestSelect({ type: 'edit', messageId: message.id })
    }
  }
}
