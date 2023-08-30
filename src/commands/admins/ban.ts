import { EmbedBuilder, ApplicationCommandOptionType, ApplicationCommandType, type TextChannel } from 'discord.js'
import { Command } from '@/structs/types/Command'
import { LogsDiscord } from '@/app'

export default new Command({
  name: 'ban',
  description: 'Bane um usuário do servidor',
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'usuário',
      description: 'Usuário a ser banido',
      required: true,
      type: ApplicationCommandOptionType.User
    },
    {
      name: 'motivo',
      description: 'Motivo do banimento',
      type: ApplicationCommandOptionType.String
    }
  ],
  async run ({ interaction, options }) {
    const user: any = options.getUser('usuário')
    const reason = options.getString('motivo') ?? 'Nenhum motivo especificado'
    const { guild } = interaction
    const logsChannel = guild?.channels.cache.find(
      (channel: { name: string }) => channel.name === 'logs'
    ) as TextChannel

    if ((interaction?.memberPermissions?.has('Administrator')) === false) {
      console.log(
        'BAN',
        `O usuario ${interaction.user.username} de ID:${interaction.user.id} tentou usar o banir sem ter permissão.`
      )
      await interaction.reply({
        content: 'Você não tem permissão para banir usuários!',
        ephemeral: true
      })
      void LogsDiscord(
        interaction,
        '⚠️ Aviso', 'Usuário sem permissão tentou executar um comando',
        `<@${interaction.user.id}> Tentou banir o usuário <@${user.id}>\nMotivo: ${reason}`,
        'Orange'
      )
      return
    }

    if (user.id === interaction.user.id) {
      const embed = new EmbedBuilder()
        .setColor('Yellow')
        .setDescription('Você não pode se banir do servidor.')
      return await interaction.reply({ embeds: [embed], ephemeral: true })
    }

    // Tenta banir o usuário
    try {
      await guild?.members.ban(user, { reason })
      // Adiciona o log de warning após o comando ter sido executado
      console.log(
        'BAN',
        `O usuario ${interaction.user.username} com o ID: ${interaction.user.id} baniu o ${user.username} de ID: ${user.id}`
      )
      const embed = new EmbedBuilder()
        .setColor('Green')
        .setTitle('Usuário banido com sucesso!')
        .setDescription(
          `${user?.username}#${user?.id} foi banido do servidor.`
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
