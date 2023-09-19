import { EmbedBuilder, ApplicationCommandOptionType, ApplicationCommandType, type TextChannel, ButtonBuilder, ButtonStyle, ComponentType, codeBlock, type ColorResolvable, ActionRowBuilder, Collection, ModalBuilder, TextInputStyle, type Attachment, AttachmentBuilder } from 'discord.js'
import { Command, Component } from '@/discord/base'
import { LogsDiscord } from '@/app'
import { brBuilder, createModalInput, createRow } from '@magicyan/discord'
import { getTimestamp } from '@/controllers/loggings/getTimestamp'

interface MessageProps {
  channelId: string
  image: Attachment | null
}

const members = new Collection<string, MessageProps>()

new Command({
  name: 'anunciar',
  description: '[ 💎 Moderação ] Enviar uma mensagem ao chat especificado.',
  dmPermission: false,
  type: ApplicationCommandType.ChatInput,
  options: [
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
      description: 'Possibilita o envio personalizado de uma imagem a embed',
      type: ApplicationCommandOptionType.Attachment,
      required: false
    },
    {
      name: 'marcar',
      description: 'Marcar um cargo',
      type: ApplicationCommandOptionType.Role,
      required: false

    }
  ],
  async run (interaction) {
    if (!(interaction?.memberPermissions?.has('Administrator'))) {
      await interaction.reply({
        content: '**❌ - Você não possui permissão para utilizar este comando.**'
      })
      await LogsDiscord.logGenerator(
        interaction,
        interaction.guild,
        'warn',
        'noPermission',
        'Orange',
        []
      )
      return
    }

    const { options, member } = interaction

    const channel = options.getChannel('canal', true)
    const color = options.getString('cor')
    const image = options.getAttachment('imagem')
    const cargoSlash = options.getRole('marcar')

    members.set(member.id, { channelId: channel.id, image })

    await interaction.showModal(new ModalBuilder({
      custom_id: 'modalAnunciar',
      title: 'Mensagem a ser enviada',
      components: [
        createModalInput({
          customId: 'title',
          label: 'Titulo',
          placeholder: 'Coloque um titulo bem objetivo',
          style: TextInputStyle.Paragraph,
          required: false,
          maxLength: 256
        }),
        createModalInput({
          customId: 'description',
          label: 'Descrição',
          placeholder: 'Coloque uma descrição bem objetivo',
          style: TextInputStyle.Paragraph,
          required: false,
          maxLength: 4000
        }),
        createModalInput({
          customId: 'cor',
          label: 'Cor da embed',
          placeholder: 'Cor em Hexadecimal. Ex: #22c55e',
          value: color ?? '#22c55e',
          style: TextInputStyle.Short,
          required: false
        }),
        createModalInput({
          customId: 'cargo',
          label: 'Cargo a ser marcado no envio da embed',
          placeholder: 'ID do cargo',
          value: cargoSlash?.id ?? undefined,
          style: TextInputStyle.Short,
          required: false
        })
      ]
    })
    )
  }
})

new Component({
  customId: 'modalAnunciar',
  type: 'Modal',
  cache: 'cached',
  async run (interaction) {
    await interaction.deferReply({ ephemeral: true })
    const { fields, guild, user, member } = interaction
    const fieldNames = ['title', 'description', 'cor', 'cargo']

    const messageProps = members.get(member.id)
    if (messageProps === undefined) {
      await interaction.editReply({
        content: '❌ | Não foi possivel obter os dados! Tente novamente.'
      })
    }

    const data: any = {}

    for (const field of fieldNames) {
      const message = fields.getTextInputValue(field)

      if (message !== null && message !== '') {
        data[field] = message
      } else {
        data[field] = null
      }
    }

    const { title, description, cor, cargo } = data
    console.log(data)
    console.log(messageProps)
    const sendChannel = guild?.channels.cache.get(String(messageProps?.channelId)) as TextChannel

    const embed = new EmbedBuilder({
      title,
      description,
      footer: ({ text: `Equipe ${guild?.name}`, iconURL: (user.avatarURL({ size: 64 }) ?? undefined) }),
      image: ({ url: 'attachment://image.png' })
    })
      .setTimestamp()

    const files: AttachmentBuilder[] = []

    if (messageProps?.image !== null) {
      files.push(new AttachmentBuilder(String(messageProps?.image.url), { name: 'image.png' }))
    }
    if (cor !== null) {
      embed.setColor(cor as ColorResolvable)
    } else {
      embed.setColor('Random')
    }

    const message = await interaction.editReply({
      embeds: [
        embed, new EmbedBuilder({
          description: `Deseja enviar a mensagem ao canal ${sendChannel.name}`
        })
          .setColor('Green')
      ],
      files,
      components: [createRow(
        new ButtonBuilder({ custom_id: 'embed-confirm-button', label: 'Confirmar', style: ButtonStyle.Success }),
        new ButtonBuilder({ custom_id: 'embed-cancel-button', label: 'Cancelar', style: ButtonStyle.Danger })
      )]
    })
    const collector = message.createMessageComponentCollector({ componentType: ComponentType.Button })
    collector.on('collect', async subInteraction => {
      collector.stop()
      const clearData = { components: [], embeds: [], files: [] }

      if (subInteraction.customId === 'embed-cancel-button') {
        void subInteraction.update({
          ...clearData,
          embeds: [
            new EmbedBuilder({
              description: 'Você cancelou a ação'
            })
              .setColor('Red')
          ]
        })
        return
      }

      if (sendChannel !== undefined) {
        const content = (cargo !== null ? `<@&${cargo}>` : undefined)

        await sendChannel.send({
          content,
          embeds: [embed],
          files
        })
          .then(async () => {
            await subInteraction.update({
              ...clearData,
              embeds: [
                new EmbedBuilder()
                  .setDescription(`✅ | Mensagem enviada com sucesso ao chat: <#${sendChannel.id}>`)
                  .setColor('Green')
              ],
              components: [
                new ActionRowBuilder<ButtonBuilder>().addComponents(
                  new ButtonBuilder()
                    .setLabel('Clique para ir ao canal')
                    .setURL(
                  `https://discord.com/channels/${guild?.id}/${sendChannel.id}`
                    )
                    .setStyle(ButtonStyle.Link)
                )
              ]
            })
          })
          .catch(async err => await subInteraction.update({
            ...clearData,
            content: brBuilder('Não foi possível enviar a mensagem com a embed', codeBlock('ts', err))
          }))
      }
    })
  }
})
