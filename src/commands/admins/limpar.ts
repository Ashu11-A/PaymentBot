import { LogsDiscord } from '@/app'
import { Command } from '@/structs/types/Command'
import { brBuilder } from '@/utils/Format'
import { ApplicationCommandOptionType, codeBlock, type TextChannel } from 'discord.js'

export default new Command({
  name: 'limpar',
  description: '[ ⭐ Moderação ] Comando de limpar mensagens',
  options: [
    {
      name: 'quantidade',
      description: 'quantidade de mensagens a serem limpas',
      type: ApplicationCommandOptionType.Integer,
      required: true
    },
    {
      name: 'autor',
      description: 'Limpa mensagens de apenas um usuário',
      type: ApplicationCommandOptionType.User
    },
    {
      name: 'mensagem',
      description: 'Deletar uma mensagem específica do canal',
      type: ApplicationCommandOptionType.String,
      autocomplete: true
    }
  ],
  async autoComplete (interaction) {
    const { options } = interaction
    const channel = interaction?.channel as TextChannel
    const focused = options.getFocused(true)

    switch (focused.name) {
      case 'mensagem':{
        if (!channel?.isTextBased()) return
        const messages = await channel?.messages.fetch()
        const choices = Array.from(messages)
          .map(([id, { content, author, createdAt }]) => {
            const time = createdAt.toLocaleDateString('pt-BR')
            const [hour, minute] = time.split(':')
            const text = `${hour}:${minute} ${author.displayName}: ${content}`
            const name = text.length > 90 ? text.slice(0, 90) + '...' : text
            return { name, value: id }
          })
        const filtered = choices.filter(c => c.name.toLocaleLowerCase().includes(focused.value.toLocaleLowerCase()))
        await interaction.respond(filtered.slice(0, 25))
      }
    }
  },
  async run ({ interaction, options }) {
    const { channel } = interaction

    await interaction.deferReply({ ephemeral: true })

    if ((interaction?.memberPermissions?.has('Administrator')) === false) {
      if (channel?.isTextBased() === false) {
        await interaction.reply({
          content: '**❌ - Você não possui permissão para utilizar este comando.**',
          ephemeral: true
        })
      }
      void LogsDiscord(
        interaction,
        'warn',
        'noPermission',
        'Orange',
        []
      )
      return
    }

    const amount = options.getInteger('quantidade', true)
    const mention = options.getUser('autor')
    const messageId = options.getString('mensagem')
    const canal = interaction?.channel as TextChannel

    if (messageId !== null) {
      channel?.messages.delete(messageId)
        .then(async () => await interaction.editReply({
          content: 'A mensagem foi deletada com sucesso!'
        }))
        .catch(async (err) => await interaction.editReply({
          content: brBuilder('Não foi possível deletar a mensagem', codeBlock('ts', err))
        }))
      return
    }

    if (mention !== null) {
      const messages = await canal.messages.fetch()
      const filtered = messages.filter(m => m.author.id === mention.id)
      await canal?.bulkDelete(filtered.first(Math.min(amount, 100)))
        .then(async (cleared) => await interaction.editReply({
          content: (cleared.size !== 0)
            ? `${cleared.size} mensagens de ${mention.username} foram deletadas com sucesso!`
            : `Não há mensagens de ${mention.username} para serem deletadas!`
        }))
        .catch(async (err) => await interaction.editReply({
          content: brBuilder('Não foi possível deletar as mensagens!', codeBlock('ts', err))
        }))
      return
    }

    await canal?.bulkDelete(Math.min(amount, 100))
      .then(async (cleared) => await interaction.editReply({
        content: (cleared.size !== 0)
          ? `${cleared.size} mensagens foram deletadas com sucesso!`
          : 'Não há mensagens para serem deletadas!'
      }))
      .catch(async (err) => await interaction.editReply({
        content: brBuilder('Não foi possível deletar as mensagens!', codeBlock('ts', err))
      }))
  }
})
