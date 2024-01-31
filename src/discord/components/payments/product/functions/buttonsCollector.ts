import { db } from '@/app'
import { CustomButtonBuilder } from '@/functions'
import { createRow } from '@magicyan/discord'
import { type ModalSubmitInteraction, type CacheType, type ButtonInteraction, type CommandInteraction, type Message, ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder, MessageCollector, type SelectMenuComponentOptionData, StringSelectMenuBuilder, type TextBasedChannel, type StringSelectMenuInteraction } from 'discord.js'
import { checkProduct } from '../../functions/checkConfig'
import { type productData } from '@/interfaces'
import { UpdateProduct } from './updateProduct'
import { Pterodactyl } from '@/classes/pterodactyl'

interface ProductButtonType {
  interaction:
  | ModalSubmitInteraction<CacheType>
  | ButtonInteraction<CacheType>
  | CommandInteraction<CacheType>
  | StringSelectMenuInteraction<CacheType>
  message: Message<boolean>
}
export class ProductButtonCollector {
  private readonly interaction
  private readonly message
  constructor ({ interaction, message }: ProductButtonType) {
    this.interaction = interaction
    this.message = message
  }

  /**
   * Muda os botões para os usuários (Modo Produção)
   */
  public async buttonsUsers (): Promise<void> {
    const { interaction, message } = this
    if (!interaction.isButton()) return

    const { guildId, channelId, user } = interaction
    const productData = (await db.messages.get(
          `${guildId}.payments.${channelId}.messages.${message.id}`
    )) as productData

    const checkRes = await checkProduct({ interaction, productData })
    if (!checkRes[0]) {
      await interaction.editReply({
        embeds: [
          new EmbedBuilder({
            title: '⚠️ Faltam configurar algumas propriedades!',
            description: checkRes[1]
          }).setColor('Red')
        ]
      })
      return
    }

    const row1Buttons = [
      await CustomButtonBuilder.create({
        type: 'Product',
        customId: 'Buy',
        label: 'Adicionar ao Carrinho',
        style: ButtonStyle.Success,
        emoji: { name: '🛒' }
      }),
      await CustomButtonBuilder.create({
        permission: 'Admin',
        type: 'Product',
        customId: 'Config',
        style: ButtonStyle.Secondary,
        emoji: { name: '⚙️' },
        isProtected: { user }
      })
    ]

    const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
      ...row1Buttons
    )

    for (const value of row1Buttons) {
      const { customId } = value

      if (customId === 'Buy') {
        if (productData?.status !== undefined && productData.status) {
          value.setDisabled(false)
        } else {
          value.setDisabled(true)
        }
      }
    }

    const clearData = { components: [] }

    await message.edit({ ...clearData, components: [row1] })
    await interaction.editReply({
      embeds: [
        new EmbedBuilder({
          title: 'Modo de Produção Ativado.'
        }).setColor('Green')
      ]
    })
  }

  /**
       * Exporta o produto em um arquivo.json
       */
  public async export (): Promise<void> {
    const { interaction, message } = this
    const { guildId, channelId } = interaction

    const productData = (await db.messages.get(
          `${guildId}.payments.${channelId}.messages.${message.id}`
    )) as productData
    const jsonData = JSON.stringify(
      productData,
      (key, value) => {
        if (typeof value === 'string') {
          return value.replace(/`/g, '\\`')
        }
        return value
      },
      4
    )
    const buffer = Buffer.from(jsonData, 'utf-8')
    const attachment = new AttachmentBuilder(buffer, {
      name: `product_${message.id}.json`
    })
    await interaction.editReply({
      files: [attachment]
    })
  }

  /**
       * Importa um produto de um arquivo.json
       */
  public async import (): Promise<void> {
    const { interaction, message } = this
    const { guildId, channelId } = interaction
    const now = new Date()
    const futureTime = new Date(now.getTime() + 60000)
    await interaction
      .editReply({
        embeds: [
          new EmbedBuilder({
            title: 'Envie o arquivo Json.',
            description: `Tempo restante: <t:${Math.floor(
                  futureTime.getTime() / 1000
                )}:R>`
          }).setColor('Blue')
        ]
      })
      .then(async () => {
        const collector = new MessageCollector(
          interaction.channel as TextBasedChannel,
          {
            max: 1,
            time: 60000
          }
        )

        collector.on('collect', async (subInteraction) => {
          try {
            const file = subInteraction.attachments.first()
            console.log(file)

            if (file === undefined) {
              await interaction.followUp({
                ephemeral,
                content: 'Isso não me parece um arquivo!'
              })
              await subInteraction.delete()
              return
            }

            const fileName = file.name
            if (!fileName.endsWith('.json')) {
              await interaction.followUp({
                ephemeral,
                content: 'O arquivo enviado não é um JSON válido.'
              })
              await subInteraction.delete()
              return
            }

            const fileUrl = file.url
            const response = await fetch(fileUrl)

            if (response.ok) {
              const jsonData = await response.json()
              const cleanedJsonData = JSON.stringify(jsonData).replace(
                /\\\\`/g,
                '`'
              )

              await interaction.followUp({
                ephemeral,
                embeds: [
                  new EmbedBuilder({
                    title: 'Arquivo JSON recebido!'
                  }).setColor('Green')
                ]
              })

              await subInteraction.delete()
              collector.stop()

              const json = JSON.parse(cleanedJsonData)
              delete json.id
              console.log(json)
              const productData = (await db.messages.get(
                    `${guildId}.payments.${channelId}.messages.${message?.id}`
              )) as productData
              await db.messages.set(
                    `${guildId}.payments.${channelId}.messages.${message?.id}`,
                    {
                      id: productData.id,
                      ...json
                    }
              )
              if (message !== null) {
                const product = new UpdateProduct({ interaction, message })
                await product.embed({})
                await interaction.followUp({
                  ephemeral,
                  embeds: [
                    new EmbedBuilder({
                      title: 'Dados Atualizados!',
                      description: 'As informações do produto foram alteradas!'
                    }).setColor('Green')
                  ]
                })
              }
            }
          } catch (error) {
            console.error(error)
            await interaction.followUp({
              ephemeral,
              content: 'Ocorreu um erro ao coletar o arquivo.'
            })
            await subInteraction.delete()
          }
        })
        collector.on('end', async () => {
          await interaction.followUp({
            ephemeral,
            embeds: [
              new EmbedBuilder({
                title: 'Coletor foi desativado.'
              })
            ]
          })
        })
      })
  }

  /**
    * Habilita ou Desabilita o produto
    */
  public async paymentStatus (): Promise<void> {
    const { interaction, message } = this
    const { guildId, channelId } = interaction
    let { status } = (await db.messages.get(
          `${guildId}.payments.${channelId}.messages.${message.id}`
    )) as productData
    if (status === undefined || !status) {
      status = true
    } else {
      status = false
    }

    await db.messages.set(
          `${guildId}.payments.${channelId}.messages.${message.id}.status`,
          status
    )
    const product = new UpdateProduct({ interaction, message })
    await product.buttonsConfig({})
    const embed = new EmbedBuilder({
      title: `Produto ${status ? 'Ativado' : 'Desativado'} com sucesso.`
    })
    if (status) {
      embed.setColor('Green')
    } else {
      embed.setColor('Red')
    }
    await interaction.editReply({
      embeds: [embed]
    })
  }

  public async delete (): Promise<void> {
    const { interaction, message } = this
    const { guildId, channelId } = interaction

    const messagePrimary = await this.interaction.editReply({
      embeds: [
        new EmbedBuilder({
          title: 'Tem certeza deseja deletar esse produto?'
        })
      ],
      components: [
        createRow(
          new ButtonBuilder({
            customId: 'embed-confirm-button',
            label: 'Confirmar',
            style: ButtonStyle.Success
          }),
          new ButtonBuilder({
            customId: 'embed-cancel-button',
            label: 'Cancelar',
            style: ButtonStyle.Danger
          })
        )
      ]
    })
    const collector = messagePrimary.createMessageComponentCollector({
      componentType: ComponentType.Button
    })
    collector.on('collect', async (subInteraction) => {
      collector.stop()
      const clearData = { components: [], embeds: [] }

      if (subInteraction.customId === 'embed-cancel-button') {
        await subInteraction.update({
          ...clearData,
          embeds: [
            new EmbedBuilder({
              description: 'Você cancelou a ação!'
            }).setColor('Green')
          ]
        })
      } else if (subInteraction.customId === 'embed-confirm-button') {
        await db.messages.delete(
              `${guildId}.payments.${channelId}.messages.${message.id}`
        )
        await message.delete()
        await interaction.editReply({
          ...clearData,
          embeds: [
            new EmbedBuilder({
              title: '📦 | Produto deletado com sucesso!'
            }).setColor('Red')
          ]
        })
      }
    })
  }

  /**
    * Selecionar Nest
    */
  public async NestSelect (options: {
    type?: 'reply' | 'edit'
    messageId?: string
  }): Promise<void> {
    const { interaction, message } = this
    const { messageId, type } = options
    const { guildId } = interaction

    const { url: urlPtero, tokenPanel: tokenPtero } = (await db.payments.get(
          `${guildId}.config.pterodactyl`
    )) ?? { url: undefined, tokenPanel: undefined }

    const PterodactylBuilder = new Pterodactyl({ url: urlPtero, token: tokenPtero })

    const listNest = await PterodactylBuilder.getNests()
    if (listNest === undefined) {
      await interaction.editReply({
        embeds: [
          new EmbedBuilder({
            title: '❌ | Ocorreu um erro ao solicitar ao Back-end do Petrodactyl a lista de Nests existentes.'
          })
        ]
      })
      return
    }
    const optionsMenu: SelectMenuComponentOptionData[] = []

    for (const [position, nest] of listNest.entries()) {
      if (position >= 25) continue
      const { name, id, uuid, description } = nest.attributes
      console.log(name, id, uuid)
      optionsMenu.push({
        value: `${id}-${messageId ?? message.id}`,
        description: ((description?.length >= 50) ? (description?.substring(0, 50) + '...') : description ?? uuid),
        label: name
      })
    }

    const row = new ActionRowBuilder<StringSelectMenuBuilder>({
      components: [
        new StringSelectMenuBuilder({
          custom_id: '-1_Admin_Product_NestSelect',
          placeholder: 'Seleciona o Nest onde o Egg está',
          minValues: 1,
          maxValues: 1,
          options: optionsMenu
        })
      ]
    })

    if (type === undefined) {
      await interaction.reply({
        components: [row]
      })
    } else if (type === 'edit') {
      const clearData = { components: [] }
      await message.edit({
        ...clearData,
        components: [row]
      })
      await interaction.deleteReply()
    }
  }
}
