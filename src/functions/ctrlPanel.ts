import { core, db } from '@/app'
import axios from 'axios'
import { ButtonBuilder, ButtonStyle, EmbedBuilder, type InteractionResponse, type ModalSubmitInteraction } from 'discord.js'
import { numerosParaLetras } from './Format'
import { createRow } from '@magicyan/discord'
import { updateProgressAndEstimation } from '.'
import { type User } from '@/discord/components/payments'

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ctrlPanel {
  /**
      * searchEmail
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

    if (status === true) {
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
      await msg.edit({
        embeds: [
          new EmbedBuilder({
            title: 'Desculpe-me, mas o E-mail informado não foi encontrado, tente novamente...'
          }).setColor('Red')
        ],
        components: [createRow(
          new ButtonBuilder({
            customId: 'deleteMsg',
            label: 'Entendo',
            style: ButtonStyle.Success
          })
        )]
      })
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
    const metadata = await db.ctrlPanel.table(numerosParaLetras(guildId)).get('metadata')
    let runsUpdate: number = 0

    if (metadata?.last_page === undefined) {
      await this.updateDatabase({ url, token, guildId, msg })
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
        }
      }

      if (runsUpdate < 1) {
        await ctrlPanel.updateDatabase({ url, token, guildId, msg })
        runsUpdate++
        return await scan()
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
    msg: InteractionResponse<boolean>
  }): Promise<void> {
    const { url, token, guildId, msg } = options
    const usersData: User [] = []
    const startTime = Date.now()

    async function fetchUsers (urlAPI: string): Promise<void> {
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
          const { id, name, email, credits, pterodactyl_id: pterodactylId } = user
          usersData.push({
            id,
            name,
            email,
            credits,
            pterodactylId
          })
        }

        if (pageNumber !== undefined) {
          if (pageNumber <= data.last_page) {
            const dataBD = await db.ctrlPanel.table(numerosParaLetras(guildId)).get(String(pageNumber))

            if (Array.isArray(dataBD)) {
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
            } else {
              core.error('dataDB não é um array iterável.')
            }

            if (pageNumber === data.last_page) {
              const metadata = {
                last_page: data.last_page,
                users_per_page: data.per_page,
                from: data.from,
                to: data.to,
                total: data.total
              }
              console.log(metadata)
              await db.ctrlPanel.table(numerosParaLetras(guildId)).set('metadata', metadata)
            }
          }
        }

        if (data.next_page_url !== null) {
          usersData.length = 0
          await fetchUsers(data.next_page_url)
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

    // Iniciar o processo de busca e salvamento de usuários
    const initialUrl = `${url}/api/users?page=1`
    await fetchUsers(initialUrl)
  }
}
