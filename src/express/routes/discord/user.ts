import { client } from '@/app'
import { type Request, type Response } from 'express'

class User {
  /**
   * Pesquisa informações de um certo user
   */
  public async post (req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined> {
    const { userId } = req.body

    if (userId === undefined || typeof userId !== 'string') {
      return res.status(400).json({
        status: 400,
        error: 'Missing or invalid parameter'
      })
    }

    let foundUser = null

    try {
      const guilds = client.guilds.cache

      for (const [, guild] of guilds) {
        const user = await guild.client.users.fetch(userId)
        const member = await guild.members.fetch(userId)

        const roles = member.roles.cache.map(role => ({
          id: role.id,
          name: role.name,
          color: role.color
        }))

        const presence = {
          activities: member.presence?.activities,
          status: member.presence?.status,
          clientStatus: member.presence?.clientStatus
        }

        // Aqui você pode retornar as informações do usuário, incluindo status de presença e roles
        foundUser = {
          user,
          presence,
          member: {
            guildId: guild.id,
            roles
          }
        }
        if (foundUser !== null) break
      }
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao obter informações do usuário' })
    }

    if (foundUser !== null) {
      return res.status(200).json(foundUser)
    } else {
      return res.status(404).json({ message: 'Usuário ou Membro/Guild não encontrado, use uma guild que o bot esteja presente' })
    }
  }
}

export const Root = new User()
