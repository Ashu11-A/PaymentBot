import { core, db } from '@/app'
import axios from 'axios'
import { EmbedBuilder, type ModalSubmitInteraction } from 'discord.js'
import { numerosParaLetras } from './Format'

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
      await interaction.editReply({
        embeds: [
          new EmbedBuilder({
            title: '☹️ | Desculpe-me, mas o dono do servidor não configurou essa opção...'
          }).setColor('Red')
        ]
      })
      return
    }
    console.log(ctrlPanelData)
    const { url, token } = ctrlPanelData

    await interaction.editReply({
      embeds: [
        new EmbedBuilder({
          title: 'Aguarde, estou consultando os seus dados...'
        }).setColor('Yellow')
      ]
    }).then(async (msg) => {
      await this.saveUsers({ url, token, guildId })
    })
  }

  private static async saveUsers (options: {
    url: string
    token: string
    guildId: string
  }): Promise<void> {
    const { url, token, guildId } = options
    const usersData: object[] = []

    function updateJSON (user: any): void {
      usersData.push({
        id: user.id,
        name: user.name,
        email: user.email
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

    async function saveUsersToDB (id: string): Promise<void> {
      await db.ctrlPanel.table(numerosParaLetras(guildId)).set(`${id}`, usersData).then(() => {
        usersData.length = 0
      })
    }

    async function fetchUsers (urlAPI: string): Promise<void> {
      console.log('URL recebida: ' + urlAPI)
      await axios
        .get(urlAPI, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`
          }
        }).then(async (response) => {
          console.log(response.data)
          const data = response.data
          const users = data.data
          const pageNumber = await idURL(urlAPI)

          for (const user of users) {
            updateJSON(user)
          }

          if (pageNumber !== undefined) {
            await saveUsersToDB(pageNumber)
            console.log(data.last_page, Number(pageNumber))
            if (data.last_page === Number(pageNumber)) {
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
            await fetchUsers(data.next_page_url)
          }
        })
        .catch((error) => {
          console.error(error)
        })
    }
    // Iniciar o processo de busca e salvamento de usuários
    const initialUrl = `${url}/api/users?page=1`
    console.log(initialUrl)
    await fetchUsers(initialUrl)
  }
}
