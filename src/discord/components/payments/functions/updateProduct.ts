import { core, db } from '@/app'
import { createRowEdit } from '@/discord/components/SUEE/functions/createRowEdit'
import { CustomButtonBuilder } from '@/functions'
import {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  MessageCollector,
  type APIActionRowComponent,
  type APIButtonComponent,
  type ButtonInteraction,
  type CacheType,
  type CommandInteraction,
  type Message,
  type ModalSubmitInteraction,
  type TextBasedChannel,
  type EmbedData,
  ComponentType
} from 'discord.js'
import { checkProduct } from './checkConfig'
import { type productData } from './interfaces'
import { createRow } from '@magicyan/discord'
import { settings } from '@/settings'

interface UpdateProductType {
  interaction:
  | ModalSubmitInteraction<CacheType>
  | ButtonInteraction<CacheType>
  | CommandInteraction<CacheType>
  message: Message<boolean>
}
export class UpdateProduct {
  private readonly interaction
  private readonly message
  constructor ({ interaction, message }: UpdateProductType) {
    this.interaction = interaction
    this.message = message
  }

  /**
   * Atualiza/Cria os botões de configuração do Produto
   */
  public async embed (options: {
    button?: string // isso será o customId
  }): Promise<void> {
    const { interaction, message } = this
    const { button } = options
    const { guildId, channelId } = interaction
    const productData = (await db.messages.get(
      `${guildId}.payments.${channelId}.messages.${message?.id}`
    )) as productData
    const updateEmbed = new EmbedBuilder(productData?.embed as EmbedData)

    if (productData?.price !== undefined) {
      updateEmbed.addFields({
        name: '💵 | Preço:',
        value: `R$${productData.price}`
      })
    }
    if (
      productData?.properties?.SetCtrlPanel &&
      productData?.coins !== undefined
    ) {
      updateEmbed.addFields({
        name: '🪙 | Coins:',
        value: String(productData.coins)
      })
    }
    if (productData?.properties?.SetPterodactyl && productData.pterodactyl !== undefined) {
      const { cpu, disk, port, ram } = productData.pterodactyl
      const { Emojis } = settings as { Emojis: Record<string, string | undefined> }
      const strings: string[] = []

      if (cpu !== undefined) strings.push(`${Emojis?.cpu ?? '🖥️'} | CPU: ${cpu}`)
      if (disk !== undefined) strings.push(`${Emojis?.disk ?? '💿'} | Disco: ${disk}`)
      if (port !== undefined) strings.push(`${Emojis?.port ?? '🌐'} | Porta: ${port}`)
      if (ram !== undefined) strings.push(`${Emojis?.ram ?? '🎟'} | Ram:  ${ram}`)

      updateEmbed.setDescription(`${updateEmbed.data.description}\n${strings.join('\n')}`)
    }

    if (productData?.role !== undefined && productData.role !== '') {
      updateEmbed.addFields({
        name: '🛂 | Você receberá o cargo:',
        value: `<@&${productData.role}>`
      })
    }

    if (
      productData?.embed !== undefined &&
      typeof productData.embed.color === 'string'
    ) {
      if (productData.embed.color?.startsWith('#')) {
        updateEmbed.setColor(parseInt(productData.embed.color.slice(1), 16))
      }
    }

    await message.edit({ embeds: [updateEmbed] }).then(async () => {
      await db.messages
        .set(
          `${guildId}.payments.${channelId}.messages.${message?.id}.properties.${button}`,
          true
        )
        .then(async () => {
          await this.buttonsConfig({ button })
        })
    })
  }

  /**
   * Atualiza/Cria os botões de configuração do Produto
   */
  public async buttonsConfig (options: {
    switchBotton?: boolean
    button?: string
  }): Promise<void> {
    const { interaction, message } = this
    const { switchBotton, button } = options
    const { guildId, channelId, user } = interaction
    const productData = (await db.messages.get(
      `${guildId}.payments.${channelId}.messages.${message.id}`
    )) as productData

    let customId: string | undefined
    if (button !== undefined) {
      customId = button
    } else if (interaction.isButton() || interaction.isModalSubmit()) {
      customId = CustomButtonBuilder.getAction(interaction.customId)
    }

    async function createSecondaryRow (): Promise<
    ActionRowBuilder<ButtonBuilder>
    > {
      const row2Buttons = [
        await CustomButtonBuilder.create({
          permission: 'Admin',
          type: 'Product',
          customId: 'SetPrice',
          label: 'Preço',
          emoji: { name: '💰' },
          isProtected: { user }
        }),
        await CustomButtonBuilder.create({
          permission: 'Admin',
          type: 'Product',
          customId: 'SetRole',
          label: 'Add Cargo',
          emoji: { name: '🛂' },
          isProtected: { user }
        }),
        await CustomButtonBuilder.create({
          permission: 'Admin',
          type: 'Product',
          customId: 'Export',
          label: 'Exportar',
          emoji: { name: '📤' },
          isProtected: { user }
        }),
        await CustomButtonBuilder.create({
          permission: 'Admin',
          type: 'Product',
          customId: 'Import',
          label: 'Importar',
          emoji: { name: '📥' },
          isProtected: { user }
        })
      ]

      const componetUpdate: string[] = []
      for (const value of row2Buttons) {
        const { customId } = value
        if (customId === undefined) continue

        if (productData?.properties?.[customId] !== undefined) {
          value.setStyle(ButtonStyle.Primary)
        } else {
          value.setStyle(ButtonStyle.Secondary)
        }
        componetUpdate.push(customId)
      }
      core.info(`Atualizando componentes | ${componetUpdate.join(' | ')}`)
      return new ActionRowBuilder<ButtonBuilder>().addComponents(
        ...row2Buttons
      )
    }

    async function createThirdRow (): Promise<ActionRowBuilder<ButtonBuilder>> {
      const redeemSystem = [
        await CustomButtonBuilder.create({
          permission: 'Admin',
          type: 'Product',
          customId: 'SetEstoque',
          label: 'Estoque',
          emoji: { name: '🗃️' },
          style: ButtonStyle.Secondary,
          isProtected: { user }
        }),
        await CustomButtonBuilder.create({
          permission: 'Admin',
          type: 'Product',
          customId: 'AddEstoque',
          label: 'Add Estoque',
          emoji: { name: '➕' },
          style: ButtonStyle.Secondary,
          disabled: true,
          isProtected: { user }
        }),
        await CustomButtonBuilder.create({
          permission: 'Admin',
          type: 'Product',
          customId: 'SetCtrlPanel',
          label: 'CrtlPanel',
          emoji: { name: '💻' },
          style: ButtonStyle.Secondary,
          isProtected: { user }
        }),
        await CustomButtonBuilder.create({
          permission: 'Admin',
          type: 'Product',
          customId: 'AddCoins',
          label: 'Moedas',
          emoji: { name: '🪙' },
          style: ButtonStyle.Secondary,
          disabled: true,
          isProtected: { user }
        })
      ]
      const componetUpdate: string[] = []
      for (const value of redeemSystem) {
        const { customId } = value
        if (customId === undefined) continue

        if (productData?.properties?.[customId]) {
          value.setStyle(ButtonStyle.Primary)
        } else {
          value.setStyle(ButtonStyle.Secondary)
        }

        if (customId === 'AddEstoque' && productData?.properties?.SetEstoque) {
          value.setDisabled(false)
        }
        if (customId === 'AddCoins' && productData?.properties?.SetCtrlPanel) {
          value.setDisabled(false)
          if (productData?.coins !== undefined) {
            value.setStyle(ButtonStyle.Primary)
          } else {
            value.setStyle(ButtonStyle.Secondary)
          }
        }
        componetUpdate.push(customId)
      }
      core.info(`Atualizando componentes | ${componetUpdate.join(' | ')}`)
      return new ActionRowBuilder<ButtonBuilder>().addComponents(
        ...redeemSystem
      )
    }

    async function createFourRow (): Promise<ActionRowBuilder<ButtonBuilder>> {
      const PterodactylConfig = [
        await CustomButtonBuilder.create({
          permission: 'Admin',
          type: 'Product',
          customId: 'SetPterodactyl',
          label: 'Pterodactyl',
          emoji: { name: '🦖' },
          isProtected: { user },
          style: ButtonStyle.Secondary
        }),
        await CustomButtonBuilder.create({
          permission: 'Admin',
          type: 'Product',
          customId: 'CPU',
          label: 'CPU',
          emoji: { name: 'cpu', id: '789745130507599882' },
          isProtected: { user },
          style: ButtonStyle.Secondary
        }),
        await CustomButtonBuilder.create({
          permission: 'Admin',
          type: 'Product',
          customId: 'Ram',
          label: 'Ram',
          emoji: { name: 'Ram', id: '789745215690244107' },
          isProtected: { user },
          style: ButtonStyle.Secondary
        }),
        await CustomButtonBuilder.create({
          permission: 'Admin',
          type: 'Product',
          customId: 'Disk',
          label: 'Disco',
          emoji: { name: '🗃️' },
          isProtected: { user },
          style: ButtonStyle.Secondary
        }),
        await CustomButtonBuilder.create({
          permission: 'Admin',
          type: 'Product',
          customId: 'Port',
          label: 'Portas',
          emoji: { name: '🌐' },
          isProtected: { user },
          style: ButtonStyle.Secondary
        })
      ]

      const componetUpdate: string[] = []
      for (const value of PterodactylConfig) {
        const { customId } = value
        if (customId === undefined) continue

        if (productData.properties?.[customId]) {
          value.setStyle(ButtonStyle.Primary)
        } else {
          value.setStyle(ButtonStyle.Secondary)
        }

        if (
          !productData?.properties?.SetPterodactyl &&
          customId !== 'SetPterodactyl'
        ) {
          value.setDisabled(true)
        }

        componetUpdate.push(customId)
      }

      core.info(`Atualizando componentes | ${componetUpdate.join(' | ')}`)
      return new ActionRowBuilder<ButtonBuilder>().addComponents(
        ...PterodactylConfig
      )
    }
    async function createFooterRow (): Promise<ActionRowBuilder<ButtonBuilder>> {
      const footerBar = [
        await CustomButtonBuilder.create({
          permission: 'Admin',
          type: 'Product',
          customId: 'Save',
          label: 'Salvar',
          emoji: { name: '✔️' },
          style: ButtonStyle.Success,
          isProtected: { user }
        }),
        await CustomButtonBuilder.create({
          permission: 'Admin',
          type: 'Product',
          customId: 'Status',
          label: 'Ativar/Desativar',
          isProtected: { user }
        }),
        await CustomButtonBuilder.create({
          permission: 'Admin',
          type: 'Product',
          customId: 'Delete',
          label: 'Apagar Produto',
          emoji: { name: '✖️' },
          style: ButtonStyle.Danger,
          isProtected: { user }
        })
      ]
      const componetUpdate: string[] = []
      for (const value of footerBar) {
        const { customId } = value

        if (customId === 'Status') {
          if (productData?.status) {
            value
              .setLabel('Ativado')
              .setEmoji('✅')
              .setStyle(ButtonStyle.Primary)
          } else {
            value
              .setLabel('Desativado')
              .setEmoji('❌')
              .setStyle(ButtonStyle.Secondary)
          }
        }
        if (typeof customId === 'string') componetUpdate.push(customId)
      }
      core.info(`Atualizando componentes | ${componetUpdate.join(' | ')}`)
      return new ActionRowBuilder<ButtonBuilder>().addComponents(...footerBar)
    }

    // Mapeia o customId para o número da fileira
    const buttonRowMap: Record<string, number> = {
      SetName: 1,
      SetDesc: 1,
      SetMiniature: 1,
      SetBanner: 1,
      SetColor: 1,
      SetPrice: 2,
      SetRole: 2,
      Export: 2,
      Import: 2,
      SetEstoque: 3,
      AddEstoque: 3,
      SetCtrlPanel: 3,
      AddCoins: 3,
      SetPterodactyl: 4,
      Ram: 4,
      Disk: 4,
      CPU: 4,
      Port: 4,
      Save: 5,
      Status: 5,
      Delete: 5
    }

    if (
      message.components[1] !== undefined ||
      (customId !== undefined && customId !== 'Config')
    ) {
      const rowNumber: number | undefined =
        customId === undefined
          ? undefined
          : customId.includes('-')
            ? buttonRowMap[customId.split('-')[1]]
            : buttonRowMap[customId]

      // Chama a função apropriada com base no número da fileira
      if (typeof rowNumber === 'number') {
        let updatedRow:
        | APIActionRowComponent<APIButtonComponent>
        | Array<{ table: number, row: APIActionRowComponent<APIButtonComponent> }>
        | null = null

        switch (rowNumber) {
          case 1:
            updatedRow = (
              await createRowEdit(interaction, message, 'payments')
            ).toJSON()
            break
          case 2:
            updatedRow = (await createSecondaryRow()).toJSON()
            break
          case 3:
            updatedRow = [
              { table: 3, row: (await createThirdRow()).toJSON() },
              { table: 4, row: (await createFourRow()).toJSON() }
            ]
            break
          case 4:
            updatedRow = [
              { table: 3, row: (await createThirdRow()).toJSON() },
              { table: 4, row: (await createFourRow()).toJSON() }
            ]
            break
          case 5:
            updatedRow = (await createFooterRow()).toJSON()
            break
        }
        if (updatedRow !== null) {
          const components: any[] = [...message.components]
          if (Array.isArray(updatedRow)) {
            for (const { table, row } of updatedRow) {
              components[table - 1] = row
            }
          } else {
            // Atualize apenas a fileira relevante
            components[rowNumber - 1] = updatedRow
          }
          await message.edit({ components })
        }
      } else {
        console.log(`Erro: rowNumber: ${rowNumber}, customId: ${customId}`)
        await interaction.editReply({
          content: '❌ | Ocorreu um erro!'
        })
      }
    } else {
      const row1 = await createRowEdit(interaction, message, 'payments')
      const row2 = await createSecondaryRow()
      const row3 = await createThirdRow()
      const row4 = await createFourRow()
      const row5 = await createFooterRow()
      await message.edit({ components: [row1, row2, row3, row4, row5] })
      if (switchBotton === true) {
        await interaction.editReply({
          embeds: [
            new EmbedBuilder({
              title: 'Modo de Edição Ativado.'
            }).setColor('Green')
          ]
        })
      }
    }
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
                await this.embed({})
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
    await this.buttonsConfig({})
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
}
