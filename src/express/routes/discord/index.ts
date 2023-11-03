import { type Request, type Response } from 'express'
import { client } from '@/app'
import { Component } from '@/discord/base'

// Cria uma nova coleção para armazenar as interações

class Discord {
  /**
    * Discord Api Info
    */
  public get (req: Request, res: Response): object {
    const commands = client.application?.commands.cache
    const { guilds, users } = client
    try {
      return res.json({
        status: 200,
        bot: {
          uptime: ((client.uptime ?? 0) / 1000).toFixed(2),
          commands: {
            loaded: commands?.size,
            names: [commands?.map((command: { name: string }) => command.name)]
          },
          buttons: Component.all.filter((component) => component.type === 'Button').length,
          modals: Component.all.filter((component) => component.type === 'Modal').length,
          selects: Component.all.filter((component) => component.type === 'StringSelect').length
        },
        guilds: {
          totalUsers: users.cache.size,
          totalGuilds: guilds.cache.size,
          guilds: guilds.cache.map(guild => ({
            name: guild.name,
            users: guild.memberCount
          })
          )
        }
      }).status(200)
    } catch {
      return res.json({
        status: 500
      }).status(500)
    }
  }
}

export const Root = new Discord()
