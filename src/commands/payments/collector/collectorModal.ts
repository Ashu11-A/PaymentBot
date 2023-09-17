import { db } from '@/app'
import { paymentButtonsConfig } from '@/commands/payments/utils/paymentUpdateConfig'
import { validarValor } from '@/utils/Validator'
import { type ModalSubmitInteraction, type CacheType } from 'discord.js'

export default async function collectorModal (interaction: ModalSubmitInteraction<CacheType>, key: string, value: any): Promise<void> {
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

    await db.messages.set(`${guildId}.payments.${channelId}.messages.${message?.id}.${type}`, messageModal)
    await channel?.messages.fetch(String(message?.id))
      .then(async (msg) => {
        const { role: roleID, embed } = await db.messages.get(`${guildId}.payments.${channelId}.messages.${message?.id}`)

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
            await db.messages.set(`${guildId}.payments.${channelId}.messages.${message?.id}.properties.${customId}`, true)
              .then(async () => {
                await paymentButtonsConfig(interaction, msg)
                await interaction.editReply({ content: `${type} alterado para ${messageModal}` })
              })
          })
      })
      .catch(async (err: Error) => {
        console.log(err)
        await interaction.editReply({ content: '❌ | Ocorreu um erro!' })
      })
  }
}
