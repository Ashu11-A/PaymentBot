import { EmbedBuilder, ApplicationCommandOptionType, ApplicationCommandType, type TextChannel, GuildMember } from 'discord.js'
import { Command } from '@/structs/types/Command'
import { LogsDiscord, client, db } from '@/app'

export default new Command({
  name: 'ban',
  description: '[ ⭐ Moderação ] Bane um usuário do servidor',
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'usuário',
      description: 'Usuário a ser banido',
      required: true,
      type: ApplicationCommandOptionType.User
    },
    {
      name: 'deletar-mensagens',
      description: 'Excluir mensagens a quantos dias?',
      type: ApplicationCommandOptionType.Number,
      choices: [
        { name: 'Deletar mensagens de até 7d atrás', value: 7 },
        { name: 'Deletar mensagens de até 6d atrás', value: 6 },
        { name: 'Deletar mensagens de até 5d atrás', value: 5 },
        { name: 'Deletar mensagens de até 4d atrás', value: 4 },
        { name: 'Deletar mensagens de até 3d atrás', value: 3 },
        { name: 'Deletar mensagens de até 2d atrás', value: 2 },
        { name: 'Deletar mensagens de até 1d atrás', value: 1 },
        { name: 'Deletar nenhuma mensagem', value: 0 }
      ],
      required: false
    },
    {
      name: 'motivo',
      description: 'Motivo do banimento',
      type: ApplicationCommandOptionType.String
    }
  ],
  async run ({ interaction, options }) {
    const user = options.getUser('usuário', true)
    const member = options.getMember('usuário')
    const deleteMSG = options.getNumber('deletar-mensagens') ?? 0
    const reason = options.getString('motivo') ?? 'Nenhum motivo especificado'

    const logsDB = await db.guilds.get(`${interaction?.guild?.id}.channel_logs`) as string
    const logsChannel = interaction.guild?.channels.cache.get(logsDB) as TextChannel

    if ((interaction?.memberPermissions?.has('Administrator')) === false) {
      await interaction.reply({
        content: '❌ - Você não tem permissão para banir usuários!',
        ephemeral: true
      })
      void LogsDiscord(
        interaction,
        'warn',
        'noPermissionBanKick',
        'Orange',
        [{ userID: user.id, reason, actionType: 'banir' }]
      )
      return
    }

    if (user.id === interaction.user.id) {
      const unauthorizedEmbed = new EmbedBuilder()
        .setColor('Yellow')
        .setTitle('Não permitido!')
        .setDescription('❌ - Você não pode se banir do servidor.')
      return await interaction.reply({ embeds: [unauthorizedEmbed], ephemeral: true })
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
      if (member instanceof GuildMember) {
        await member?.ban({ reason, deleteMessageSeconds: deleteMSG })
      }
      // Adiciona o log de warning após o comando ter sido executado
      console.log(
        'BAN',
        `O usuario ${interaction.user.username} com o ID: ${interaction.user.id} baniu o ${user.username} de ID: ${user.id}`
      )
      const embed = new EmbedBuilder()
        .setColor('Green')
        .setTitle('Usuário banido com sucesso!')
        .setDescription(
          `User: ${user?.username}, de ID: ${user?.id} foi banido do servidor.`
        )
        .addFields(
          {
            name: 'Usuário banido',
            value: `${user?.username}, ID: ${user?.id}`
          },
          {
            name: 'Moderador responsável',
            value: `${interaction.user.username}`
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
        content: 'Ocorreu um erro ao banir o usuário!',
        ephemeral: true
      })
    }
  }
})
