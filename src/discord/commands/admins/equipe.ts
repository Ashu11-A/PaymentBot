import { EmbedBuilder, ApplicationCommandOptionType, ApplicationCommandType, type TextChannel } from 'discord.js'
import { Command } from '@/discord/base'
import { db } from '@/app'
import { Discord } from '@/functions'

new Command({
  name: 'equipe',
  dmPermission,
  description: '[ 💎 Moderação ] Add/Rem alguém da equipe',
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
  async run (interaction) {
    const { options } = interaction
    const user = options.getUser('usuário')
    const member = interaction.guild?.members.cache.get(String(user?.id))
    const cargo = options.getRole('cargo')
    const type = options.getString('tipo') ?? 'add'
    const { guild } = interaction
    const channelDB = await db.guilds.get(`${interaction?.guild?.id}.channel.staff_logs`)
    const sendChannel = guild?.channels.cache.get(channelDB) as TextChannel

    const havePermision = await Discord.Permission(interaction, 'ManageRoles')
    if (havePermision) return

    if (user?.id === interaction.user.id) {
      const embed = new EmbedBuilder()
        .setColor('Yellow')
        .setDescription('❌ - Você não pode utilizar este comando em sí mesmo.')
      return await interaction.reply({ embeds: [embed], ephemeral: true })
    }

    let message: string = ''
    try {
      if (type === 'add') {
        message = `adicionado a equipe como <@&${cargo?.id}>`
        member?.roles.add(String(cargo?.id))
          .then(async () => {
            await db.staff.set(`${interaction?.guild?.id}.members.${user?.id}`, {
              user: user?.username,
              role: cargo?.id
            })
          })
          .catch(async (err) => {
            console.log(err)
            return await interaction.reply({
              content: 'Ocorreu um erro!',
              ephemeral: true
            })
          })
      } else if (type === 'rem') {
        message = 'não integra mais a equipe'
        member?.roles.remove(String(cargo?.id))
          .then(async () => {
            await db.guilds.delete(`${interaction?.guild?.id}.members.staff.${user?.id}`)
          })
          .catch(async (err) => {
            console.log(err)
            return await interaction.reply({
              content: 'Ocorreu um erro!',
              ephemeral: true
            })
          })
      }
      const embed = new EmbedBuilder()
        .setColor(cargo?.color ?? 'Random')
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
