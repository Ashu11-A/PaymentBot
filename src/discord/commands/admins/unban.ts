import { EmbedBuilder, ApplicationCommandOptionType, ApplicationCommandType, type TextChannel, codeBlock } from 'discord.js'
import { Command } from '@/discord/base'
import { db } from '@/app'
import { brBuilder } from '@magicyan/discord'
import { Discord } from '@/functions'

new Command({
  name: 'unban',
  description: '[ 💎 Moderação ] Desbane um usuário do servidor',
  dmPermission,
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
  async run (interaction) {
    await interaction.deferReply()
    const { guild, options } = interaction

    const userID = options.getString('usuário', true)
    const reason: string = options.getString('motivo') ?? 'Nenhum motivo especificado'

    const logsDB = await db.guilds.get(`${interaction?.guild?.id}.channel.logs`) as string
    const logsChannel = interaction.guild?.channels.cache.get(logsDB) as TextChannel

    const havePermision = await Discord.Permission(interaction, 'BanMembers', 'noPermissionBanKick')
    if (havePermision) return

    try {
      if (isNaN(Number(userID))) {
        const embed = new EmbedBuilder()
          .setTitle('Erro')
          .setDescription('O ID do usuário especificado é inválido.')
          .setColor('Red')
        return await interaction.editReply({ embeds: [embed] })
      }

      const bans = await guild?.bans.fetch()
      if (bans?.has(userID) !== null && !(bans?.has(userID))) {
        const embed = new EmbedBuilder()
          .setTitle('Erro')
          .setDescription('O usuário especificado não está banido.')
          .setColor('Red')
        return await interaction.editReply({ embeds: [embed] })
      }

      await guild?.members.unban(userID, reason)
        .then(async () => {
          const embed = new EmbedBuilder()
            .setColor('Green')
            .setTitle('Usuário desbanido com sucesso!')
            .setDescription(
          `${userID} foi desbanido do servidor.`
            )
            .addFields(
              {
                name: 'Usuário desbanido',
                value: codeBlock(`ID: ${userID}`)
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

          await interaction.editReply({ embeds: [embed] })
        }).catch(async (err) => {
          await interaction.editReply({
            content: brBuilder('Ocorreu um erro ao desbanir o usuário!', codeBlock('ts', err))
          })
        })
    } catch (err) {
      await interaction.editReply({
        content: brBuilder('Ocorreu um erro ao desbanir o usuário!', codeBlock('ts', String(err)))
      })
    }
  }
})
