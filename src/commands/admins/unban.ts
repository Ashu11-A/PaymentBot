import { EmbedBuilder, ApplicationCommandOptionType, ApplicationCommandType, type TextChannel, codeBlock } from 'discord.js'
import { Command } from '@/structs/types/Command'
import { LogsDiscord, db } from '@/app'
import { brBuilder } from '@/utils/Format'

export default new Command({
  name: 'unban',
  description: '[ 💎 Moderação ] Desbane um usuário do servidor',
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'usuário',
      description: 'ID do usuário a ser desbanido',
      required: true,
      type: ApplicationCommandOptionType.String
    },
    {
      name: 'motivo',
      description: 'Motivo do desbanimento',
      type: ApplicationCommandOptionType.String
    }
  ],
  async run ({ interaction, options }) {
    await interaction.deferReply({ ephemeral: true })
    const userID: any = options.getString('usuário')
    const reason: string = options.getString('motivo') ?? 'Nenhum motivo especificado'
    const { guild } = interaction
    const logsDB = await db.guilds.get(`${interaction?.guild?.id}.channel_logs`) as string
    const logsChannel = interaction.guild?.channels.cache.get(logsDB) as TextChannel

    if ((interaction?.memberPermissions?.has('BanMembers')) === false) {
      await interaction.editReply({
        content: '❌ - Você não tem permissão para desbanir usuários!'
      })
      void LogsDiscord(
        interaction,
        'warn',
        'noPermissionBanKick',
        'Orange',
        [{ userID, reason, actionType: 'desbanir' }]
      )
      return
    }
    try {
      // Verificar se o usuário a ser desbanido está realmente banido
      const bans = await guild?.bans.fetch()
      if (bans?.has(userID) !== null) {
        const embed = new EmbedBuilder()
          .setTitle('Erro')
          .setDescription('O usuário especificado não está banido.')
          .setColor('Red')
        return await interaction.editReply({ embeds: [embed] })
      }

      // Verificar se o ID do usuário é válido
      if (isNaN(userID)) {
        const embed = new EmbedBuilder()
          .setTitle('Erro')
          .setDescription('O ID do usuário especificado é inválido.')
          .setColor('Red')
        return await interaction.editReply({ embeds: [embed] })
      }
      await guild?.members.unban(userID, reason)
        .then(async () => {
          const embed = new EmbedBuilder()
            .setColor('Green')
            .setTitle('Usuário desbanido com sucesso!')
            .setDescription(
          `${interaction.user?.username}#${userID} foi desbanido do servidor.`
            )
            .addFields(
              {
                name: 'Usuário desbanido',
                value: `ID: ${userID}`
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
            await logsChannel.send({ embeds: [embed] })
          }

          return await interaction.editReply({ embeds: [embed] })
        }).catch(async (err) => {
          return await interaction.editReply({
            content: brBuilder('Ocorreu um erro ao desbanir o usuário!', codeBlock('ts', err))
          })
        })
    } catch (err) {
      return await interaction.editReply({
        content: brBuilder('Ocorreu um erro ao desbanir o usuário!', codeBlock('ts', String(err)))
      })
    }
  }
})
