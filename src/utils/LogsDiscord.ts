import { db } from '@/app'
import { type ColorResolvable, type TextChannel, type CommandInteraction, type CacheType, EmbedBuilder, type MessageInteraction, type Guild } from 'discord.js'

export async function LogsDiscord (interaction: CommandInteraction<CacheType> | MessageInteraction, guild: Guild | null, type: string, cause: string, color: ColorResolvable, infos: any): Promise<void> {
  const logsDB = await db.guilds.get(`${guild?.id}.channel.logs`) as string
  const logsChannel = guild?.channels.cache.get(logsDB) as TextChannel

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
        value = `<@${interaction.user.id}> Tentou usar o comando` + '```' + `/${interaction.commandName}` + '```'
        break
      }
      case 'noPermissionBanKick': {
        const [{ userID, reason, actionType }] = infos
        name = 'Usuário sem permissão tentou executar um comando'
        value = `<@${interaction.user.id}> Tentou ${actionType} o usuário <@${userID}>\nMotivo: ${reason}`
        break
      }
      case 'messageDelete': {
        name = 'Mensagem apagada era uma embed do sistema!'
        value = 'Alguém Apagou uma mensagem que em teoria não poderia!\nDeletando mensagem do Database...'
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
