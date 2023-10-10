import { core, db } from '@/app'
import axios from 'axios'
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder, codeBlock, type InteractionResponse, type ModalSubmitInteraction } from 'discord.js'
import { numerosParaLetras } from './Format'
import { createRow } from '@magicyan/discord'
import { updateProgressAndEstimation } from '.'
import { type User } from '@/discord/components/payments'
import randomstring from 'randomstring'
import { type RequestBodyCtrlPanelVoucher } from '@/discord/events/ready/express/routes/voucher'

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ctrlPanel {
  /**
    * Pesquisar um E-mail específico
    */
  public static async searchEmail (options: {
    interaction: ModalSubmitInteraction<'cached' | 'raw'>
    email: string
  }): Promise<any> {
    const { interaction, email } = options
    const { guildId } = interaction
    const ctrlPanelData = await db.payments.get(`${guildId}.config.ctrlPanel`)

    if (ctrlPanelData?.token === undefined || ctrlPanelData?.url === undefined) {
      await interaction.reply({
        ephemeral,
        embeds: [
          new EmbedBuilder({
            title: '☹️ | Desculpe-me, mas o dono do servidor não configurou essa opção...'
          }).setColor('Red')
        ]
      })
      return
    }
    const { url, token } = ctrlPanelData

    const msg = await interaction.reply({
      embeds: [
        new EmbedBuilder({
          title: 'Aguarde, estou consultando os seus dados...'
        }).setColor('Yellow')
      ]
    })

    const [status, userData] = await this.findEmail({ guildId, email, url, token, msg })

    return await response({ status, userData, runs: 0 })

    async function response (options: {
      status: boolean
      userData: any[]
      runs?: number
    }): Promise<any> {
      const { status, userData, runs } = options
      if (status) {
        await msg.edit({
          embeds: [
            new EmbedBuilder({
              title: `👋 Olá ${userData[0].name}`,
              description: 'Sabia que seu id é ' + '`' + userData[0].id + '`' + '?'
            }).setColor('Green')
          ],
          components: [createRow(
            new ButtonBuilder({
              customId: 'deleteMsg',
              label: 'Sim, sou eu!',
              style: ButtonStyle.Success
            })
          )]
        })
        return userData[0]
      } else {
        let title: string = ''
        if (runs === 0) {
          title = 'Desculpe-me, mas o E-mail informado não foi encontrado...'
        } else {
          title = 'Desculpe-me, mas realmente não achei o E-mail informado, tente novamente...'
        }

        const embed = new EmbedBuilder({
          title,
          fields: [
            {
              name: '✉️ E-mail:',
              value: codeBlock(email)
            }
          ]
        }).setColor('Red')

        const row = new ActionRowBuilder<ButtonBuilder>()
        if (runs === 0) {
          embed.setFooter({ iconURL: (interaction?.guild?.iconURL({ size: 64 }) ?? undefined), text: 'Se sua conta for nova, faça uma pesquisa avançada' })
          row.addComponents(
            new ButtonBuilder({
              customId: 'ctrlpanel-advanced-search',
              emoji: '🔎',
              label: 'Pesquisa Avançada',
              style: ButtonStyle.Primary
            })
          )
        }
        row.addComponents(
          new ButtonBuilder({
            customId: 'deleteMsg',
            label: 'Entendo',
            style: ButtonStyle.Danger
          })
        )

        const message = await msg.edit({
          embeds: [embed],
          components: [row]
        })

        if (runs === 0) {
          const collector = message.createMessageComponentCollector({ componentType: ComponentType.Button })

          collector.on('collect', async subInteraction => {
            collector.stop()
            await subInteraction.reply({
              ephemeral,
              embeds: [
                new EmbedBuilder({
                  title: 'Realizando pesquisa...'
                }).setColor('Aqua')
              ]
            })
            if (subInteraction.customId === 'ctrlpanel-advanced-search') {
              await ctrlPanel.updateDatabase({ url, token, guildId, msg })
              const [status, userData] = await ctrlPanel.findEmail({ guildId, email, url, token, msg })

              return await response({ status, userData, runs: 1 })
            }
          })
        }
      }
    }
  }

  private static async findEmail (options: {
    email: string
    guildId: string
    url: string
    token: string
    msg: InteractionResponse<boolean>
  }): Promise<boolean | any> {
    const { guildId, email, token, url, msg } = options
    let metadata = await db.ctrlPanel.table(numerosParaLetras(guildId)).get('metadata')

    if (metadata?.last_page === undefined) {
      metadata = await this.updateDatabase({ url, token, guildId, msg })
    }

    core.info(`Procurando: ${email}`)
    let foundUsers: any[] = []

    async function scan (): Promise<[boolean, any[]] | [boolean] | undefined> {
      for (let page = 1; page <= metadata.last_page; page++) {
        const dataDB = await db.ctrlPanel.table(numerosParaLetras(guildId)).get(String(page))

        if (Array.isArray(dataDB)) {
          foundUsers = dataDB.filter(
            (user: { email: string }) => user.email.toLowerCase() === email.toLowerCase()
          )

          if (foundUsers.length > 0) {
            core.info(`Pesquisando: ${page}/${metadata.last_page} | Encontrei`)
            return [true, foundUsers]
          } else {
            core.info(`Pesquisando: ${page}/${metadata.last_page} |`)
          }
        } else {
          core.error('dataDB não é um array iterável.')
          return [false]
        }

        if (page === metadata.last_page) {
          return [false]
        }
      }
    }
    return await scan()
  }

  private static async updateDatabase (options: {
    url: string
    token: string
    guildId: string
    msg: InteractionResponse<boolean>
  }): Promise<{ last_page: number, users_per_page: number, from: number, to: number, total: number } | undefined> {
    const { url, token, guildId, msg } = options
    const usersData: User [] = []
    const startTime = Date.now()

    async function fetchUsers (urlAPI: string): Promise<{ last_page: number, users_per_page: number, from: number, to: number, total: number } | undefined> {
      try {
        const response = await axios.get(urlAPI, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`
          }
        })

        const data: any = response.data
        const users: any[] = data.data
        const pageNumber = Number(await idURL(urlAPI))

        for (const user of users) {
          const { id, name, email, pterodactyl_id: pterodactylId } = user
          usersData.push({
            id,
            name,
            email,
            pterodactylId
          })
        }

        if (pageNumber !== undefined) {
          if (pageNumber <= data.last_page) {
            const dataBD = await db.ctrlPanel.table(numerosParaLetras(guildId)).get(String(pageNumber))

            if (dataBD?.length <= 50 || usersData?.length > 0) {
              let isDataChanged = false

              for (let i = 0; i < 50; i++) {
                if (usersData?.[i] !== undefined && i >= 0 && i < usersData.length) {
                  if (
                    (dataBD?.[i] === undefined) ||
                      (JSON.stringify(usersData?.[i]) !== JSON.stringify(dataBD?.[i]))
                  ) {
                    // Se houver diferenças, marque como dados alterados
                    isDataChanged = true
                    break
                  }
                }
              }
              if (isDataChanged) {
                core.info(`Tabela: ${pageNumber}/${data.last_page} | Mesclando`)
                await db.ctrlPanel.table(numerosParaLetras(guildId)).set(`${pageNumber}`, usersData)
              } else {
                core.info(`Tabela: ${pageNumber}/${data.last_page} | Sincronizado`)
              }

              if (pageNumber % 2 === 0) {
                const { progress, estimatedTimeRemaining } = updateProgressAndEstimation({
                  totalTables: data.last_page,
                  currentTable: pageNumber,
                  startTime
                })
                await msg.edit({
                  components: [],
                  embeds: [
                    new EmbedBuilder({
                      title: 'Fazendo pesquisa avançada...',
                      fields: [
                        {
                          name: 'Tabelas:',
                          value: `${pageNumber}/${data.last_page}`
                        },
                        {
                          name: 'Users:',
                          value: `${data.from} - ${data.to} / ${data.total}`
                        }
                      ],
                      footer: { text: `${progress.toFixed(2)}% | Tempo Restante: ${estimatedTimeRemaining.toFixed(2)}s` }
                    }).setColor('Green')
                  ]
                })
              }
            }

            if (pageNumber === data.last_page) {
              // eslint-disable-next-line @typescript-eslint/naming-convention
              const { last_page, per_page: users_per_page, from, to, total } = data
              const metadata = {
                last_page,
                users_per_page,
                from,
                to,
                total
              }
              await db.ctrlPanel.table(numerosParaLetras(guildId)).set('metadata', metadata)
              return metadata
            } else if (data.next_page_url !== null) {
              usersData.length = 0
              return await fetchUsers(data.next_page_url)
            }
          }
        }
      } catch (err: any) {
        core.error(err)
      }
    }

    async function idURL (url: string): Promise<string | undefined> {
      const match = url.match(/page=(\d+)/)
      if (match !== null) {
        const pageNumber = match[1]
        return pageNumber
      }
      return undefined
    }

    // Iniciar o processo sincronizar os dados externos com os atuais
    const initialUrl = `${url}/api/users?page=1`
    return await fetchUsers(initialUrl)
  }

  /**
   * Criar voucher
   */
  public static async createVoucher (options: {
    dataCtrlPanelVoucher: RequestBodyCtrlPanelVoucher
  }): Promise<[ string, string ] | [undefined, undefined]> {
    try {
      const { dataCtrlPanelVoucher } = options
      const { user, name, credits, price, productId, guild } = dataCtrlPanelVoucher
      const ctrlPanelData = await db.payments.get(`${guild.id}.config.ctrlPanel`)
      const pass = randomstring.generate({ length: 36 })
      const code = pass.toString()

      if (ctrlPanelData !== undefined) {
        const postData = {
          memo: `${user.name} (ID: ${user.id}) comprou créditos no valor de R$${price}`,
          code,
          uses: 1,
          credits
        }

        console.log(postData)

        const response = await axios.post(ctrlPanelData.url + '/api/vouchers', postData, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${ctrlPanelData.token}`
          }
        })
        const { data } = response
        if (response.status === 201 && data.status === 'VALID') {
          await db.payments.set(`approved.${productId}`, {
            userName: user.name,
            userId: user.id,
            price,
            name,
            voucherID: data.id,
            voucher: code
          })
          return [code, data.id]
        }
      }
      return [undefined, undefined]
    } catch (err) {
      console.log(err)
      return [undefined, undefined]
    }
  }
}
