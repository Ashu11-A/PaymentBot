import { core, db } from '@/app'
import axios from 'axios'
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder, codeBlock, type InteractionResponse, type ModalSubmitInteraction } from 'discord.js'
import { numerosParaLetras } from './Format'
import { createRow } from '@magicyan/discord'
import { updateProgressAndEstimation } from '.'
import { type Server, type User } from '@/discord/components/payments'

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

    const findRes = await ctrlPanel.findEmail({ guildId, email, url, token, msg })

    return await response({ status: findRes?.status, userData: findRes?.userData, runs: 0 })

    async function response (options: {
      status: boolean | undefined
      userData: any[] | undefined
      runs?: number
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    }): Promise<any> {
      const { status, userData, runs } = options
      if (status === true && userData !== undefined) {
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
              await ctrlPanel.updateDatabase({ url, token, guildId, msg, type: 'users' })
              const findRes = await ctrlPanel.findEmail({ guildId, email, url, token, msg })

              return await response({ status: findRes?.status, userData: findRes?.userData, runs: 1 })
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
  }): Promise<{
      status: boolean
      userData: any[]
    } | {
      status: boolean
      userData?: undefined
    } | undefined> {
    const { guildId, email, token, url, msg } = options
    let metadata = await db.ctrlPanel.table(`${numerosParaLetras(guildId)}_users`).get('metadata')

    if (metadata?.lastPage === undefined) {
      metadata = await this.updateDatabase({ url, token, guildId, msg, type: 'users' })
    }

    core.info(`Procurando: ${email}`)
    let foundUsers: any[] = []

    async function scan (): Promise<{
      status: boolean
      userData: any[]
    } | {
      status: boolean
      userData?: undefined
    } | undefined> {
      for (let page = 1; page <= metadata.lastPage; page++) {
        const dataDB = await db.ctrlPanel.table(`${numerosParaLetras(guildId)}_users`).get(String(page))

        if (Array.isArray(dataDB)) {
          foundUsers = dataDB.filter(
            (user: { email: string }) => user.email.toLowerCase() === email.toLowerCase()
          )

          if (foundUsers.length > 0) {
            core.info(`Pesquisando: ${page}/${metadata.lastPage} | Encontrei`)
            return { status: true, userData: foundUsers }
          } else {
            core.info(`Pesquisando: ${page}/${metadata.lastPage} |`)
          }
        } else {
          core.error('dataDB não é um array iterável.')
          return { status: false }
        }

        if (page === metadata.last_page) {
          return { status: false }
        }
      }
    }
    return await scan()
  }

  /**
   * deleteServers
   */
  public static async deleteServers (options: {
    url: string
    token: string
    guildId: string
    suspendidoApos: number
    jaFaz: number
  }): Promise<[boolean, any[]] | [boolean] | undefined> {
    const { suspendidoApos, jaFaz, guildId, url, token } = options
    let metadata = await db.ctrlPanel.table(`${numerosParaLetras(guildId)}_servers`).get('metadata')
    const foundUsers: any[] = []

    if (metadata?.lastPage === undefined) {
      metadata = await this.updateDatabase({ url, token, guildId, type: 'servers' })
    }
    async function scan (): Promise<[boolean, any[]] | [boolean] | undefined> {
      for (let page = 1; page <= metadata.lastPage; page++) {
        const dataDB = await db.ctrlPanel.table(`${numerosParaLetras(guildId)}_servers`).get(String(page))
        if (Array.isArray(dataDB)) {
          for (const server of dataDB) {
            const suspendedDate = Number(new Date(server.suspended))
            const createdDate = Number(new Date(server.createAt))
            const dataConsulta = metadata.sincDate

            const suspençãoData = (suspendedDate - createdDate) / (1000 * 60 * 60 * 24)
            const fazData = (dataConsulta - createdDate) / (1000 * 60 * 60 * 24)

            if (suspençãoData <= suspendidoApos) {
              if (fazData > jaFaz) {
                console.log('Foi suspendido depois de criado: ' + suspençãoData)
                console.log('Foi criado há: ' + fazData)
                const userInfo = await axios.get(`${url}/api/users/${server.userId}`,
                  {
                    headers: {
                      Accept: 'application/json',
                      Authorization: `Bearer ${token}`
                    }
                  }
                )
                const user = userInfo.data
                if (user.role === 'member') {
                  const { name: username, role, credits, id: idUser } = userInfo.data
                  const data = {
                    ...server,
                    idUser,
                    username,
                    role,
                    credits
                  }
                  foundUsers.push(data)
                }
              }
            }
          }
        } else {
          core.error('dataDB não é um array iterável.')
          return [false]
        }
      }
      console.log(foundUsers)
      if (foundUsers.length > 0) {
        core.info(`Foram encontrados: ${foundUsers.length} de ${metadata.total} | Suspenções`)
        return [true, foundUsers]
      } else {
        return [false]
      }
    }
    return await scan()
  }

  private static async updateDatabase (options: {
    url: string
    token: string
    guildId: string
    msg?: InteractionResponse<boolean>
    type: 'users' | 'servers' | 'all'
  }): Promise<
    { lastPage: number, perPage: number, total: number } |
    undefined> {
    const { url, token, guildId, msg, type } = options
    const usersData: User[] = []
    const serversData: Server[] = []
    const startTime = Date.now()
    let clientCount = 0
    let teamCount = 0

    async function fetchUsers (urlAPI: string): Promise<{ lastPage: number, perPage: number, total: number } | undefined> {
      try {
        const response = await axios.get(urlAPI, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`
          }
        })

        const data = response.data
        const users = data.data

        for (const user of users) {
          const { id, name, email, pterodactyl_id: pterodactylId, role } = user
          usersData.push({
            id,
            name,
            email,
            pterodactylId,
            role
          })
          if (user.role === 'client') {
            clientCount++
          }
          if (user.role === 'admin') {
            teamCount++
          }
        }

        if (data.current_page <= data.last_page) {
          const dataBD = await db.ctrlPanel.table(`${numerosParaLetras(guildId)}_users`).get(String(data.current_page))
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
              core.info(`Tabela: ${data.current_page}/${data.last_page} | Mesclando`)
              await db.ctrlPanel.table(`${numerosParaLetras(guildId)}_users`).set(`${data.current_page}`, usersData)
            } else {
              core.info(`Tabela: ${data.current_page}/${data.last_page} | Sincronizado`)
            }

            if (data.current_page % 2 === 0 && msg !== undefined) {
              const { progress, estimatedTimeRemaining } = updateProgressAndEstimation({
                totalTables: data.last_page,
                currentTable: data.current_page,
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
                        value: `${data.current_page}/${data.last_page}`
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

          if (data.current_page === data.last_page) {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            const { last_page: lastPage, per_page: perPage, total } = data
            const metadata = {
              lastPage,
              perPage,
              total,
              clientCount,
              teamCount
            }
            await db.ctrlPanel.table(`${numerosParaLetras(guildId)}_users`).set('metadata', metadata)
            return metadata
          } else if (data.next_page_url !== null) {
            usersData.length = 0
            return await fetchUsers(data.next_page_url)
          }
        }
      } catch (err) {
        console.log(err)
      }
    }

    async function fetchServers (urlAPI: string): Promise<{ lastPage: number, perPage: number, total: number } | undefined> {
      try {
        const response = await axios.get(urlAPI, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`
          }
        })

        const data = response.data
        const servers = data.data

        for (const server of servers) {
          const { user_id: userId, suspended, created_at: createAt, name, identifier, pterodactyl_id: pterodactylId } = server
          serversData.push({
            userId,
            pterodactylId,
            name,
            identifier,
            suspended,
            createAt
          })
        }

        if (data.current_page <= data.last_page) {
          const dataBD = await db.ctrlPanel.table(`${numerosParaLetras(guildId)}_servers`).get(String(data.current_page))
          if (dataBD?.length <= 50 || serversData?.length > 0) {
            let isDataChanged = false

            for (let i = 0; i < 50; i++) {
              if (serversData?.[i] !== undefined && i >= 0 && i < serversData.length) {
                if (
                  (dataBD?.[i] === undefined) ||
                  (JSON.stringify(serversData?.[i]) !== JSON.stringify(dataBD?.[i]))
                ) {
                  isDataChanged = true
                  break
                }
              }
            }
            if (isDataChanged) {
              core.info(`Tabela: ${data.current_page}/${data.last_page} | Mesclando`)
              await db.ctrlPanel.table(`${numerosParaLetras(guildId)}_servers`).set(`${data.current_page}`, serversData)
            } else {
              core.info(`Tabela: ${data.current_page}/${data.last_page} | Sincronizado`)
            }
          }

          if (data.current_page === data.last_page) {
            const { last_page: lastPage, per_page: perPage, total } = data
            const metadata = {
              lastPage,
              perPage,
              total,
              sincDate: Number(new Date())
            }
            console.log(metadata)
            await db.ctrlPanel.table(`${numerosParaLetras(guildId)}_servers`).set('metadata', metadata)
            return metadata
          } else if (data.next_page_url !== null) {
            serversData.length = 0
            return await fetchServers(data.next_page_url)
          }
        }
      } catch (err) {
        console.log(err)
      }
    }

    // Iniciar o processo sincronizar os dados externos com os atuais
    if (type === 'users' || type === 'all') {
      return await fetchUsers(`${url}/api/users?page=1`)
    } else if (type === 'servers' || type === 'all') {
      return await fetchServers(`${url}/api/servers?page=1`)
    }
  }

  /**
   * Atualiza dados dos usuários do Dash
   */
  public static async updateUser (options: {
    userID: number | undefined
    guildId: string
    post: {
      credits?: number
      name?: string
      email?: string
      role?: 'client' | 'admin'
    }
  }): Promise<[number, string] | [undefined, undefined]> {
    const { userID, guildId, post } = options
    const ctrlPanelData = await db.payments.get(`${guildId}.config.ctrlPanel`)

    try {
      if (ctrlPanelData !== undefined) {
        const { url, token } = ctrlPanelData
        // Adicionar créditos
        const response = await axios.patch(
          `${url}/api/users/${userID}/increment`,
          post,
          {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${token}`
            }
          }
        )

        if (
          typeof post.name === 'string' &&
          post.email !== undefined &&
          typeof post.role === 'string'
        ) {
          delete post.credits
          // Coloca o usuário como Client
          await axios.patch(
            `${url}/api/users/${userID}`,
            post,
            {
              headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${token}`
              }
            }
          )
        }
        const { credits } = response.data
        return [credits, url]
      }
      return [undefined, undefined]
    } catch (err) {
      console.log(err)
      return [undefined, undefined]
    }
  }
}
