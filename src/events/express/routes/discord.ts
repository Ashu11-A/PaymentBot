import { type Request, type Response } from 'express'
import { client } from '@/app'

class Discord {
  /**
    * Discord Api Info
    */
  public get (req: Request, res: Response): object {
    const { commands, buttons, selects, modals, guilds, users } = client
    try {
      return res.json({
        status: 200,
        bot: {
          commands: {
            loaded: commands.size,
            names: [commands.map(command => command.name)]
          },
          buttons: buttons.size,
          selects: selects.size,
          modals: modals.size
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
