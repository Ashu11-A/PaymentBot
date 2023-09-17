import { EmbedBuilder, ApplicationCommandOptionType, ApplicationCommandType, type TextChannel, ButtonBuilder, ButtonStyle, ComponentType, codeBlock, type ColorResolvable, ActionRowBuilder, Collection, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js'
import { Command, Component } from '@/discord/base'
import { LogsDiscord, db } from '@/app'
import { brBuilder, createRow } from '@magicyan/discord'

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
      type: ApplicationCommandOptionType.String,
      required: false,
      choices: [
        { name: 'Server', value: 'iconServer' }
      ]
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
      await interaction.editReply({
        content: '**❌ - Você não possui permissão para utilizar este comando.**'
      })
      await LogsDiscord(
        interaction,
        interaction.guild,
        'warn',
        'noPermission',
        'Orange',
        []
      )
      return
    }

    const { options } = interaction

    const channel = options.getChannel('canal', true)
    const color = options.getString('cor')
    let imageSlash = options.getString('imagem')
    const cargoSlash = options.getRole('marcar')

    await db.guilds.set(`${interaction.guildId}.channel.anunciar.${interaction.user.id}`, channel.id)

    if (imageSlash === 'iconServer') {
      imageSlash = String(interaction.guild?.iconURL({ size: 512 }))
    }

    const modal = new ModalBuilder({ custom_id: 'modalAnunciar', title: 'Mensagem a ser enviada' })
    const title = new ActionRowBuilder<TextInputBuilder>({
      components: [
        new TextInputBuilder({
          custom_id: 'title',
          label: 'Titulo',
          placeholder: 'Coloque um titulo bem objetivo',
          style: TextInputStyle.Paragraph,
          required: false,
          maxLength: 256
        })
      ]
    })
    const description = new ActionRowBuilder<TextInputBuilder>({
      components: [
        new TextInputBuilder({
          custom_id: 'description',
          label: 'Descrição',
          placeholder: 'Coloque uma descrição bem objetivo',
          style: TextInputStyle.Paragraph,
          required: false,
          maxLength: 4000
        })
      ]
    })
    const image = new ActionRowBuilder<TextInputBuilder>({
      components: [
        new TextInputBuilder({
          custom_id: 'image',
          label: 'URL da imagem',
          value: imageSlash ?? '',
          style: TextInputStyle.Short,
          required: false
        })
      ]
    })
    const cor = new ActionRowBuilder<TextInputBuilder>({
      components: [
        new TextInputBuilder({
          custom_id: 'cor',
          label: 'Cor da embed',
          placeholder: 'Cor em Hexadecimal. Ex: #22c55e',
          value: color ?? '#22c55e',
          style: TextInputStyle.Short,
          required: false
        })
      ]
    })
    const cargo = new ActionRowBuilder<TextInputBuilder>({
      components: [
        new TextInputBuilder({
          custom_id: 'cargo',
          label: 'Cargo a ser marcado no envio da embed',
          placeholder: 'ID do cargo',
          value: cargoSlash?.id ?? '',
          style: TextInputStyle.Short,
          required: false
        })
      ]
    })

    modal.setComponents(title, description, image, cor, cargo)

    await interaction.showModal(modal)
  }
})

new Component({
  customId: 'modalAnunciar',
  type: 'Modal',
  async run (interaction) {
    await interaction.deferReply({ ephemeral: true })
    const { fields, guild, guildId, user } = interaction
    const channelID = await db.guilds.get(`${guildId}.channel.anunciar.${user.id}`)
    const fieldNames = ['title', 'description', 'image', 'cor', 'cargo']

    const data: any = {}

    for (const field of fieldNames) {
      const message = fields.getTextInputValue(field)

      if (message !== null && message !== '') {
        data[field] = message
      } else {
        data[field] = null
      }
    }

    const { title, description, image, cor, cargo } = data
    const sendChannel = guild?.channels.cache.get(String(channelID)) as TextChannel

    console.log(data)
    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(description)
      .setFooter({ text: `Equipe ${guild?.name}`, iconURL: (user.avatarURL({ size: 64 }) ?? undefined) })
      .setTimestamp()

    if (cor !== null) {
      embed.setColor(cor as ColorResolvable)
    } else {
      embed.setColor('Random')
    }
    if (image !== null) {
      embed.setThumbnail(image)
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
      const clearData = { components: [], embeds: [], files: [] }

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
            await db.guilds.delete(`${guildId}.channel.anunciar.${user.id}`)
          })
          .catch(async err => await subInteraction.update({
            ...clearData,
            content: brBuilder('Não foi possível enviar a mensagem com a embed', codeBlock('ts', err))
          }))
      }
    })
  }
})
