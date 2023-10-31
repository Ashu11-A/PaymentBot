import { client } from '@/app'
import { type Request, type Response } from 'express'

class User {
  /**
   * Pesquisa informações de um certo user
   */
  public async get (req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined> {
    const { userId, guildId } = req.query

    if (userId === undefined || guildId === undefined) {
      return res.status(400).json({
        status: 400,
        error: 'Missing or invalid parameter'
      })
    }

    try {
      const user = await client.users.fetch(String(String(userId)))

      if (user !== null) {
        const guild = await client.guilds.fetch(String(guildId))
        if (guild === null) {
          return res.status(404).json({ message: 'Servidor não encontrado' })
        }

        // Obtenha o membro do servidor
        const member = await guild.members.fetch(String(userId))
        const roles = member.roles.cache.map(role => ({
          id: role.id,
          name: role.name,
          color: role.color
        }))

        if (member !== null) {
          const presence = {
            activities: member.presence?.activities,
            status: member.presence?.status,
            clientStatus: member.presence?.clientStatus
          }

          // Aqui você pode retornar as informações do usuário, incluindo status de presença e roles
          res.json({
            user,
            presence,
            member: {
              guildId: guild.id,
              roles
            }
          })
        } else {
          res.status(404).json({ message: 'Membro/Guild não encontrado, use uma guild que o bot esteja presente' })
        }
      } else {
        res.status(404).json({ message: 'Usuário não encontrado' })
      }
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Erro ao obter informações do usuário' })
    }
  }
}

export const Root = new User()
