import { LogsDiscord, client, db } from '@/app'
import { Command } from '@/discord/base'
import { EmbedBuilder, ApplicationCommandType, ApplicationCommandOptionType, type TextChannel } from 'discord.js'

new Command({
  name: 'kick',
  dmPermission,
  description: '[ 💎 Moderação ] Expulsa um usuário do servidor',
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'usuário',
      description: 'Usuário que será expulso',
      required: true,
      type: ApplicationCommandOptionType.User
    },
    {
      name: 'motivo',
      description: 'Motivo da expulsão',
      type: ApplicationCommandOptionType.String
    }
  ],
  async run (interaction) {
    const { guild, options } = interaction

    const user: any = options.getUser('usuário')
    const reason = options.getString('motivo') ?? 'Nenhum motivo especificado'

    const logsDB = await db.guilds.get(`${interaction?.guild?.id}.channel.logs`) as string
    const logsChannel = interaction.guild?.channels.cache.get(logsDB) as TextChannel

    if (!(interaction?.memberPermissions?.has('Administrator'))) {
      console.log(
        'BAN',
        `O usuario ${interaction.user.username} de ID:${interaction.user.id} tentou usar o banir sem ter permissão.`
      )
      await interaction.reply({
        content: '❌ - Você não tem permissão para expulsar usuários!',
        ephemeral: true
      })
      await LogsDiscord.logGenerator(
        interaction,
        guild,
        'warn',
        'noPermissionBanKick',
        'Orange',
        [{ userID: user.id, reason, actionType: 'expulsar' }]
      )
      return
    }

    if (user.id === interaction.user.id) {
      const embed = new EmbedBuilder()
        .setColor('Yellow')
        .setDescription('❌ - Você não pode se expulsar do servidor.')
      return await interaction.reply({ embeds: [embed], ephemeral: true })
    }

    if (user.id === client?.user?.id) {
      const unauthorizedEmbed = new EmbedBuilder()
        .setColor('Red')
        .setTitle('Não permitido!')
        .setDescription('Você quer me banir? tá marcado!')
      return await interaction.reply({ embeds: [unauthorizedEmbed], ephemeral: true })
    }

    // Tenta banir o usuário
    try {
      await guild?.members.kick(user, reason)
      // Adiciona o log de warning após o comando ter sido executado
      console.log(
        'BAN',
        `O usuario ${interaction.user.username} com o ID: ${interaction.user.id} expulsou o ${user.username} de ID: ${user.id}`
      )
      const embed = new EmbedBuilder()
        .setColor('Green')
        .setTitle('Usuário expulso com sucesso!')
        .setDescription(
          `${user?.username} foi expulso do servidor.`
        )
        .addFields(
          {
            name: 'Usuário expulso',
            value: '```User: ' + user?.username + '\n' + 'ID:' + user?.id + '```'
          },
          { name: 'Motivo', value: reason },
          {
            name: 'Data e Hora',
            value: new Date().toLocaleString('pt-BR', {
              timeZone: 'America/Sao_Paulo'
            })
          }
        )

      if (logsChannel !== undefined) {
        void logsChannel.send({ embeds: [embed] })
      }

      return await interaction.reply({ embeds: [embed] })
    } catch (error) {
      console.error(error)
      return await interaction.reply({
        content: 'Ocorreu um erro ao expulsar o usuário!',
        ephemeral: true
      })
    }
  }
})
