import { db } from '@/app'
import { type ColorResolvable, type TextChannel, type CommandInteraction, type CacheType, EmbedBuilder } from 'discord.js'

export async function LogsDiscord (interaction: CommandInteraction<CacheType>, type: string, cause: string, color: ColorResolvable, infos: any): Promise<void> {
  const { commandName, user } = interaction
  const logsDB = await db.guilds.get(`${interaction?.guild?.id}.channel_logs`) as string
  const logsChannel = interaction.guild?.channels.cache.get(logsDB) as TextChannel

  let title: string = ''
  let name: string = ''
  let value: string = ''

  try {
    switch (type) {
      case 'warn': {
        title = '⚠️ Aviso'
        break
      }
    }

    switch (cause) {
      case 'noPermission': {
        name = 'Usuário sem permissão tentou executar um comando'
        value = `<@${user.id}> Tentou usar o comando` + '```' + `/${commandName}` + '```'
        break
      }
      case 'noPermissionBanKick': {
        const [{ userID, reason, actionType }] = infos
        name = 'Usuário sem permissão tentou executar um comando'
        value = `<@${user.id}> Tentou ${actionType} o usuário <@${userID}>\nMotivo: ${reason}`
        break
      }
    }

    console.log(title, name, value)

    const embed = new EmbedBuilder()
      .setTitle(title)
      .addFields({
        name,
        value
      })
      .setColor(color)

    if (logsChannel !== undefined) {
      await logsChannel.send({ embeds: [embed] })
    }
  } catch (err) {
    console.log(err)
  }
}
