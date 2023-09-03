import { EmbedBuilder, ApplicationCommandOptionType, ApplicationCommandType, type TextChannel } from 'discord.js'
import { Command } from '@/structs/types/Command'
import { LogsDiscord } from '@/app'

export default new Command({
  name: 'equipe',
  description: '[⭐ Moderação ] Add/Rem alguem da equipe',
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'usuário',
      description: 'Usuário a ser Add/Rem',
      required: true,
      type: ApplicationCommandOptionType.User
    },
    {
      name: 'cargo',
      description: 'Cargo que o Usuário irá ganhar',
      required: true,
      type: ApplicationCommandOptionType.Role
    },
    {
      name: 'tipo',
      description: 'Adicionar ou Remover',
      type: ApplicationCommandOptionType.String,
      choices: [
        { name: 'Adicionar', value: 'add' },
        { name: 'Remover', value: 'rem' }
      ],
      required: false

    }
  ],
  async run ({ interaction, options }) {
    const user = options.getUser('usuário')
    const member = interaction.guild?.members.cache.get(String(user?.id))
    const cargo = options.getRole('cargo')
    const type = options.getString('tipo') ?? 'add'
    const { guild } = interaction
    const sendChannel = guild?.channels.cache.find(
      (channel: { name: string }) => channel.name === 'equipe'
    ) as TextChannel

    if ((interaction?.memberPermissions?.has('ManageRoles')) === false) {
      await interaction.reply({
        content: '**❌ - Você não possui permissão para utilizar este comando.**',
        ephemeral: true
      })
      void LogsDiscord(
        interaction,
        'warn',
        'noPermission',
        'Orange',
        []
      )
      return
    }

    if (user?.id === interaction.user.id) {
      const embed = new EmbedBuilder()
        .setColor('Yellow')
        .setDescription('❌ - Você não pode utilizar este comando em sí mesmo.')
      return await interaction.reply({ embeds: [embed], ephemeral: true })
    }
    let message: string = ''
    try {
      if (type === 'add') {
        message = `foi promovido ao cargo <@&${cargo?.id}>`
        member?.roles.add(String(cargo?.id)).catch(async (err) => {
          console.log(err)
          return await interaction.reply({
            content: 'Ocorreu um erro!',
            ephemeral: true
          })
        })
      } else if (type === 'rem') {
        message = 'não integra mais a equipe'
        member?.roles.remove(String(cargo?.id)).catch(async (err) => {
          console.log(err)
          return await interaction.reply({
            content: 'Ocorreu um erro!',
            ephemeral: true
          })
        })
      }
      // Adiciona o log de warning após o comando ter sido executado
      console.log(
        `O usuario ${user?.username} com o ID: ${user?.id} foi promovido para: ${cargo?.name}`
      )
      const embed = new EmbedBuilder()
        .setColor('Random')
        .setTitle('📰 | STAFF LOG')
        .setDescription(
          `<@${user?.id}> ${message}.`
        )
        .setFooter({ text: `Equipe ${interaction.guild?.name}` })
        .setTimestamp()

      if (sendChannel !== undefined) {
        await sendChannel.send({ embeds: [embed] })
      }

      return await interaction.reply({ embeds: [embed], ephemeral: true })
    } catch (error) {
      console.error(error)
      return await interaction.reply({
        content: 'Ocorreu um erro!',
        ephemeral: true
      })
    }
  }
})
