import { db } from '@/app'
import { buttonsUsers, createTicket, ticketButtonsConfig } from '@/discord/components/tickets'
import { Discord, createRow } from '@/functions'
import { type collectorButtonsForModals } from '@/settings/interfaces/Collector'
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder, ModalBuilder, TextInputBuilder, type ButtonInteraction, type CacheType, type TextChannel } from 'discord.js'

const listItens = {
  SetName: {
    label: '❓| Qual será o Título?',
    placeholder: 'Ex: Parceria',
    style: 1,
    valuee: undefined,
    maxLength: 256,
    type: 'title'
  },
  SetDesc: {
    label: '❓| Qual será a Descrição?',
    placeholder: 'Ex: Quero me tornar um parceiro.',
    style: 1,
    valuee: undefined,
    maxLength: 256,
    type: 'description'
  },
  SetEmoji: {
    label: '❓| Qual será o Emoji? (somente um)',
    placeholder: 'Ex: 🎟️🎫💰🎲💵🗂️.',
    valuee: '🎟️',
    style: 1,
    maxLength: 10,
    type: 'emoji'
  }
}

export default async function collectorButtons (interaction: ButtonInteraction<CacheType>, key: string, value: collectorButtonsForModals): Promise<void> {
  console.log(interaction.customId)
  const { guildId, message, channelId, customId } = interaction
  const { title, label, placeholder, style, type, maxLength } = value

  if (customId === 'ticketOpen') {
    await createTicket(interaction, 'Não foi possível descobrir.')
    return
  }

  if (customId === 'del-ticket' || customId === 'ticketEmbedDelete') {
    await interaction.deferReply({ ephemeral: true })

    const embed = new EmbedBuilder()
      .setColor('Gold')
    if (customId === 'del-ticket') {
      embed.setDescription('Tem certeza que deseja fechar o Ticket?')
    } else {
      embed.setDescription('Tem certeza que deseja deletar esse templete de Ticket?\nIsso ira deletar as informações do Banco de dados e Embeds.')
    }

    const messagePrimary = await interaction.editReply({
      embeds: [embed],
      components: [createRow(
        new ButtonBuilder({ customId: 'embed-confirm-button', label: 'Confirmar', style: ButtonStyle.Success }),
        new ButtonBuilder({ customId: 'embed-cancel-button', label: 'Cancelar', style: ButtonStyle.Danger })
      )]
    })
    const collector = messagePrimary.createMessageComponentCollector({ componentType: ComponentType.Button })
    collector.on('collect', async (subInteraction) => {
      collector.stop()
      const clearData = { components: [], embeds: [] }

      if (subInteraction.customId === 'embed-cancel-button') {
        await subInteraction.editReply({
          ...clearData,
          embeds: [
            new EmbedBuilder()
              .setDescription('Você cancelou a ação')
              .setColor('Green')
          ]
        })
      } else if (subInteraction.customId === 'embed-confirm-button') {
        const embed = new EmbedBuilder()
          .setColor('Red')
        if (customId === 'del-ticket') {
          embed
            .setTitle(`👋 | Olá ${interaction.user.username}`)
            .setDescription('❗️ | Esse ticket será excluído em 5 segundos.')
        } else {
          embed
            .setDescription('Deletando Banco de dados e Mensagens...')
        }
        await subInteraction.update({
          ...clearData,
          embeds: [embed]
        })
        if (customId === 'del-ticket') {
          setTimeout(() => {
            subInteraction?.channel?.delete().catch(console.error)
          }, 5000)
        } else {
          const { embedChannelID: channelEmbedID, embedMessageID: messageID } = await db.messages.get(`${guildId}.ticket.${channelId}.messages.${message?.id}`)

          if (channelEmbedID !== undefined || messageID !== undefined) {
            try {
              const channel = interaction.guild?.channels.cache.get(channelEmbedID) as TextChannel
              const msg = await channel?.messages.fetch(messageID)
              await msg.delete()
            } catch (err) {
              console.log(err)
            }
          }

          await db.messages.delete(`${guildId}.ticket.${channelId}.messages.${message?.id}`)
          await message.delete()
        }
      }
    })
    return
  }

  if (customId === 'SetSelect' || customId === 'SetButton') {
    if (customId === 'SetSelect') {
      await db.messages.set(`${guildId}.ticket.${channelId}.messages.${message.id}.properties.SetSelect`, true)
      await db.messages.set(`${guildId}.ticket.${channelId}.messages.${message.id}.properties.SetButton`, false)
    } else {
      await db.messages.set(`${guildId}.ticket.${channelId}.messages.${message.id}.properties.SetButton`, true)
      await db.messages.set(`${guildId}.ticket.${channelId}.messages.${message.id}.properties.SetSelect`, false)
    }
    await interaction.reply({ content: '⏱️ | Aguarde só um pouco...', ephemeral: true })
    await ticketButtonsConfig(interaction, message)
    return
  }

  if (await Discord.Permission(interaction, 'Administrator')) return

  if (customId === 'AddSelect') {
    const modal = new ModalBuilder({ customId: 'SelectMenu', title: 'Adicionar Opções no Select Menu' })
    Object.entries(listItens).map(async ([, value]) => {
      const { label, placeholder, style, type, maxLength, valuee } = value
      const content = new ActionRowBuilder<TextInputBuilder>({
        components: [
          new TextInputBuilder({
            custom_id: type,
            label,
            placeholder,
            style,
            value: valuee,
            required: true,
            maxLength
          })
        ]
      })
      modal.addComponents(content)
    })
    await interaction.showModal(modal)
    return
  }

  if (customId === 'SendSave') {
    try {
      const { embedChannelID: channelEmbedID, embedMessageID: messageID } = await db.messages.get(`${guildId}.ticket.${channelId}.messages.${message?.id}`)
      const channel = interaction.guild?.channels.cache.get(channelEmbedID) as TextChannel

      const msg = await channel?.messages.fetch(messageID)
      if (typeof channelEmbedID === 'string' && messageID !== undefined) {
        await buttonsUsers(interaction, message.id, msg)
        console.log('O codigo chegou aqui!', 'channelEmbedID: ' + channelEmbedID, 'messageID: ' + messageID)
        return
      }
    } catch (err) {
      console.log(err)
    }
  }

  const textValue = await db.messages.get(`${guildId}.ticket.${channelId}.messages.${message.id}.${type}`)
  const modal = new ModalBuilder({ customId, title })
  const content = new ActionRowBuilder<TextInputBuilder>({
    components: [
      new TextInputBuilder({
        custom_id: 'content',
        label,
        placeholder,
        value: textValue ?? null,
        style,
        required: true,
        maxLength
      })
    ]
  })
  modal.setComponents(content)
  await interaction.showModal(modal)
}
