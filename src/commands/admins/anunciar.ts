import { EmbedBuilder, ApplicationCommandOptionType, ApplicationCommandType, type TextChannel, ButtonBuilder, ButtonStyle, ComponentType, codeBlock, type ColorResolvable, ActionRowBuilder } from 'discord.js'
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
        { name: 'Habilitar', value: 'true' }
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
    const title = options.getString('título', true)
    const description = options.getString('descrição', true)
    const channel = options.getChannel('canal', true)
    const color = options.getString('cor')
    const image = options.getString('imagem')
    const cargo = options.getRole('marcar')
    const { guild } = interaction
    const sendChannel = guild?.channels.cache.get(String(channel?.id)) as TextChannel

    await interaction.deferReply({ ephemeral: true })

    if ((interaction?.memberPermissions?.has('Administrator')) === false) {
      await interaction.editReply({
        content: 'Você não tem permissão para usar esse comando!'
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
          .then(async () => await subInteraction.update({
            ...clearData,
            embeds: [
              new EmbedBuilder()
                .setDescription(`✅ | Mensagem enviada com sucesso ao chat: <#${sendChannel.id}>`)
                .setColor('Green')
            ],
            components: [
              new ActionRowBuilder<any>().addComponents(
                new ButtonBuilder()
                  .setLabel('Clique para ir ao canal')
                  .setURL(
                `https://discord.com/channels/${guild?.id}/${sendChannel.id}`
                  )
                  .setStyle(ButtonStyle.Link)
              )
            ]
          }))
          .catch(async err => await subInteraction.update({
            ...clearData,
            content: brBuilder('Não foi possível enviar a mensagem com a embed', codeBlock('ts', err))
          }))
      }
    })
  }
})
