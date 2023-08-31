import { EmbedBuilder, ApplicationCommandOptionType, ApplicationCommandType, type TextChannel, ButtonBuilder, ButtonStyle, ComponentType, codeBlock, type ColorResolvable } from 'discord.js'
import { Command } from '@/structs/types/Command'
import { LogsDiscord } from '@/app'
import { brBuilder } from '@/utils/Format'
import { createRow } from '@/utils/Discord'

export default new Command({
  name: 'anunciar',
  description: 'Enviar uma mensagem ao chat especificado.',
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'título',
      description: 'Titulo que será integrado a embed',
      required: true,
      type: ApplicationCommandOptionType.String
    },
    {
      name: 'descrição',
      description: 'Mensagem que será integrado a embed',
      required: true,
      type: ApplicationCommandOptionType.String
    },
    {
      name: 'canal',
      description: 'Selecionar canal onde a embed será enviada',
      type: ApplicationCommandOptionType.Channel,
      required: true
    },
    {
      name: 'cor',
      description: 'Qual cor a embed terá',
      type: ApplicationCommandOptionType.String,
      choices: [
        { name: 'Amarelo', value: '#fde047' },
        { name: 'Verde', value: '#22c55e' },
        { name: 'Vermelho', value: '#ef4444' },
        { name: 'Azul', value: '#3b86f6' },
        { name: 'Laranja', value: '#fbbd23' },
        { name: 'Rosa', value: '#c026d3' },
        { name: 'Cinza', value: '#2F3136' }
      ],
      required: false
    },
    {
      name: 'imagem',
      description: 'Habilitar logo na Embed',
      type: ApplicationCommandOptionType.String,
      choices: [
        { name: 'Habilitar', value: 'true' },
        { name: 'Desabilitar', value: 'false' }
      ],
      required: false
    },
    {
      name: 'marcar',
      description: 'Marcar um cargo',
      type: ApplicationCommandOptionType.Role,
      required: false

    }
  ],
  async run ({ interaction, options }) {
    const title = options.getString('título')
    const description = options.getString('descrição')
    const color = options.getString('cor') ?? null
    const channel = options.getChannel('canal')
    const image = options.getString('imagem') ?? 'false'
    const cargo = options.getRole('marcar') ?? null
    const { guild } = interaction
    const sendChannel = guild?.channels.cache.get(String(channel?.id)) as TextChannel

    await interaction.deferReply({ ephemeral: true })

    if ((interaction?.memberPermissions?.has('Administrator')) === false) {
      console.log(
        `O usuario ${interaction.user.username} de ID:${interaction.user.id} tentou usar o comando /anunciar sem ter permissão.`
      )
      await interaction.editReply({
        content: 'Você não tem permissão para usar esse comando!'
      })
      void LogsDiscord(
        interaction,
        '⚠️ Aviso', 'Usuário sem permissão tentou executar um comando',
        `<@${interaction.user.id}> Tentou usar o comando /anunciar`,
        'Orange'
      )
      return
    }

    if (title !== null && title.length > 256) {
      await interaction.editReply({
        content: brBuilder(
          'O título da embed deve conter no maximo 256 caracteres!',
          `O titulo que você enviou tem ${title.length} caracteres!`
        )
      })
      return
    }

    if (description !== null && description.length > 4096) {
      await interaction.editReply({
        content: brBuilder(
          'A descrição da embed deve conter no maximo 4096 caracteres!',
          `O descrição que você enviou tem ${description.length} caracteres!`
        )
      })
      return
    }
    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(description)
      .setFooter({ text: `Equipe ${interaction.guild?.name}`, iconURL: String(interaction.user.avatarURL({ size: 64 })) })
      .setTimestamp()

    if (color !== null) {
      embed.setColor(color as ColorResolvable)
    } else {
      embed.setColor('Random')
    }
    if (image === 'true') {
      embed.setThumbnail(String(interaction.guild?.iconURL({ size: 1024 })))
    }

    const message = await interaction.editReply({
      embeds: [embed, new EmbedBuilder({
        description: `Deseja enviar a mensagem ao canal ${sendChannel.name}`
      })],
      components: [createRow(
        new ButtonBuilder({ custom_id: 'embed-confirm-button', label: 'Confirmar', style: ButtonStyle.Success }),
        new ButtonBuilder({ custom_id: 'embed-cancel-button', label: 'Cancelar', style: ButtonStyle.Danger })
      )]
    })
    const collector = message.createMessageComponentCollector({ componentType: ComponentType.Button })
    collector.on('collect', async subInteraction => {
      collector.stop()
      const clearData = { components: [], embeds: [] }

      if (subInteraction.customId === 'embed-cancel-button') {
        void subInteraction.update({
          ...clearData,
          embeds: [new EmbedBuilder({
            description: 'Você cancelou a ação'
          })]
        })
        return
      }

      if (sendChannel !== undefined) {
        let msg = {}
        if (cargo !== null) {
          msg = { content: `<@&${cargo?.id}>`, embeds: [embed] }
        } else {
          msg = { embeds: [embed] }
        }
        await sendChannel.send(msg)
          .then(async msg => await subInteraction.update({
            ...clearData,
            content: `Mensagem enviada: ${msg.url}`
          }))
          .catch(async err => await subInteraction.update({
            ...clearData,
            content: brBuilder('Não foi possível enviar a mensagem com a embed', codeBlock('ts', err))
          }))
      }
    })
  }
})
