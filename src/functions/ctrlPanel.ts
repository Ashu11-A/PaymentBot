import { core, db } from '@/app'
import axios from 'axios'
import { ButtonBuilder, ButtonStyle, EmbedBuilder, type InteractionResponse, type ModalSubmitInteraction } from 'discord.js'
import { numerosParaLetras } from './Format'
import { createRow } from '@magicyan/discord'
import { updateProgressAndEstimation } from '.'

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ctrlPanel {
  /**
      * searchEmail
      */
  public static async searchEmail (options: {
    interaction: ModalSubmitInteraction<'cached' | 'raw'>
    email: string
  }): Promise<void> {
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

    if (status === false) {
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
            emoji: '👍',
            style: ButtonStyle.Success
          })
        )]
      })
    } else {
      await msg.edit({
        embeds: [
          new EmbedBuilder({
            title: `👋 Olá ${userData[0].name}`,
            description: 'Sabia que seu id é ' + '`' + userData[0].id + '`' + '?'
          })
        ]
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

    if (metadata?.last_page !== undefined) {
      core.info(`Procurando: ${email}`)
      let foundUsers: any[] = []

      async function scan (): Promise<Array<boolean | any[]> | undefined> {
        for (let page = 1; page <= metadata.last_page; page++) {
          const dataDB = await db.ctrlPanel.table(numerosParaLetras(guildId)).get(String(page))

          foundUsers = await dataDB.filter(
            (user: { email: string }) => user.email.toLowerCase() === email.toLowerCase()
          )

          if (foundUsers.length > 0) {
            core.info(`Pesquisando: ${page}/${metadata.last_page} | Encontrei`)
            return [true, foundUsers]
          } else {
            core.info(`Pesquisando: ${page}/${metadata.last_page} |`)
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
    } else {
      await this.updateDatabase({ url, token, guildId, msg })
    }
  }

  private static async updateDatabase (options: {
    url: string
    token: string
    guildId: string
    msg: InteractionResponse<boolean>
  }): Promise<void> {
    const { url, token, guildId, msg } = options
    const usersData: any[] = []
    const startTime = Date.now()

    async function fetchUsers (urlAPI: string): Promise<void> {
      await axios
        .get(urlAPI, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`
          }
        }).then(async (response) => {
          const data = response.data
          const users = data.data
          const pageNumber = await idURL(urlAPI)

          for (const user of users) {
            usersData.push({
              id: user.id,
              name: user.name,
              email: user.email
            })
          }

          if (pageNumber !== undefined) {
            if (Number(pageNumber) <= data.last_page) {
              const dataBD = await db.ctrlPanel.table(numerosParaLetras(guildId)).get(pageNumber)
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
                  core.info(`Tabela: ${Number(pageNumber)}/${data.last_page} | Mesclando`)
                  await db.ctrlPanel.table(numerosParaLetras(guildId)).set(`${pageNumber}`, usersData)
                } else {
                  core.info(`Tabela: ${Number(pageNumber)}/${data.last_page} | Sincronizado`)
                }
                const { progress, estimatedTimeRemaining } = updateProgressAndEstimation({
                  totalTables: data.last_page,
                  currentTable: Number(pageNumber),
                  startTime
                })
                await msg.edit({
                  embeds: [
                    new EmbedBuilder({
                      title: 'Fazendo pesquisa avançada...',
                      fields: [
                        {
                          name: 'Tabelas:',
                          value: `${Number(pageNumber)}/${data.last_page}`
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
            } else {
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

          if (data.next_page_url !== null) {
            usersData.length = 0
            await fetchUsers(data.next_page_url)
          }
        })
        .catch((error) => {
          console.error(error)
        })
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
