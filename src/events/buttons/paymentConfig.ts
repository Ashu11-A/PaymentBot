import { db } from '@/app'
import { buttonsConfig } from '@/commands/payments/utils/buttons'
import { Event } from '@/structs/types/Event'
import { validarCorHex, validarValor } from '@/utils/Validator'
import { ActionRowBuilder, ModalBuilder, TextInputBuilder } from 'discord.js'

const buttons = {
  paymentSetName: {
    title: '❓| Qual será o nome do produto?',
    label: 'Nome do Produto',
    placeholder: 'Ex: Plano Basic',
    style: 1,
    maxLength: 256,
    type: 'embed.title'
  },
  paymentSetDesc: {
    title: '❓| Qual será a descrição do produto?',
    label: 'Descrição do produto',
    placeholder: 'Ex: ```Este plano oferece ate 10 slots...```',
    style: 2,
    maxLength: 4000,
    type: 'embed.description'
  },
  paymentSetPrice: {
    title: '❓| Qual será o preço do produto?',
    label: 'Preço do produto',
    placeholder: 'Ex: 14,50',
    style: 1,
    maxLength: 6,
    type: 'embed.fields[0].value'
  },
  paymentSetMiniature: {
    title: '❓| Qual será a miniatura do produto?',
    label: 'Coloque um Link, ou digite "VAZIO"',
    placeholder: 'Ex: https://uma.imagemBem.ilustrativa/img.png',
    style: 1,
    maxLength: 4000,
    type: 'embed.thumbnail.url'
  },
  paymentSetBanner: {
    title: '❓| Qual será o banner do produto?',
    label: 'Coloque um Link, ou digite "VAZIO"',
    placeholder: 'Ex: https://um.bannerBem.legal/img.png',
    style: 1,
    maxLength: 4000,
    type: 'embed.image.url'
  },
  paymentSetColor: {
    title: '❓| Qual será a cor da embed?',
    label: 'Cor em hexadecimal',
    placeholder: 'Ex: #13fc03',
    style: 1,
    maxLength: 7,
    type: 'embed.color'
  },
  paymentSetRole: {
    title: '❓| Qual será o id a ser adquirido na compra?',
    label: 'Coloque um ID, ou digite "VAZIO"',
    placeholder: 'Ex: 379089880887721995',
    style: 1,
    maxLength: 30,
    type: 'role'
  }
}
export default new Event({
  name: 'interactionCreate',
  async run (interaction) {
    if (interaction.isButton()) {
      console.log(interaction.customId)
      Object.entries(buttons).map(async ([key, value]) => {
        const { guildId, message, channelId, customId } = interaction
        const { title, label, placeholder, style, type, maxLength } = value
        if (customId === key) {
          if ((interaction?.memberPermissions?.has('Administrator')) === false) {
            await interaction.reply({
              content: '**❌ - Você não possui permissão para utilizar este botão!**',
              ephemeral: true
            })
            return
          }

          const textValue = await db.payments.get(`${guildId}.channels.${channelId}.messages.${message.id}.${type}`)
          const modal = new ModalBuilder({ customId: key, title })
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
      })
    } else if (interaction.isModalSubmit()) {
      Object.entries(buttons).map(async ([key, value]) => {
        const { customId, guildId, channel, channelId, message, fields } = interaction
        if (customId === key) {
          await interaction.deferReply({ ephemeral: true })

          const { type } = value
          let messageModal = fields.getTextInputValue('content')
          console.log('type:', type)
          console.log('messageModal:', messageModal)

          if (messageModal.toLowerCase() === 'vazio') {
            messageModal = ''
          }

          if (customId === 'paymentSetPrice') {
            const [validador, message] = validarValor(messageModal)
            if (validador === false) {
              await interaction.editReply({ content: message })
              return
            }
          }

          if (customId === 'paymentSetColor') {
            const [validador, message] = validarCorHex(messageModal)
            if (validador === false) {
              await interaction.editReply({ content: message })
              return
            }
          }

          await db.payments.set(`${guildId}.channels.${channelId}.messages.${message?.id}.${type}`, messageModal)
          await channel?.messages.fetch(String(message?.id))
            .then(async (msg) => {
              const roleID = await db.payments.get(`${guildId}.channels.${channelId}.messages.${message?.id}.role`)
              const embed = await db.payments.get(`${guildId}.channels.${channelId}.messages.${message?.id}.embed`)
              console.log(roleID)
              if (roleID !== undefined && roleID !== '') {
                embed.fields[1] = {
                  name: '🛂 | Você receberá o cargo:',
                  value: `<@&${roleID}>`
                }
              } else if (embed.fields[1] !== undefined || embed.fields[1]?.value === '<@&>') {
                embed.fields.splice(1, 1)
              }
              if (typeof embed?.color === 'string') {
                if (embed?.color?.startsWith('#') === true) {
                  embed.color = parseInt(embed?.color.slice(1), 16)
                }
              }
              await msg.edit({ embeds: [embed] })
                .then(async () => {
                  await db.payments.set(`${guildId}.channels.${channelId}.messages.${message?.id}.properties.${customId}`, true)
                    .then(async () => {
                      await buttonsConfig(interaction, msg)
                      await interaction.editReply({ content: `${type} alterado para ${messageModal}` })
                    })
                })
            })
            .catch(async (err) => {
              console.log(err)
              await interaction.editReply({ content: '❌ | Ocorreu um erro!' })
            })
        }
      })
    }
  }
})
