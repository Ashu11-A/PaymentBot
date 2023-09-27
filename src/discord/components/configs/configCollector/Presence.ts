import { db } from '@/app'
import {
  type ModalSubmitInteraction,
  type CacheType,
  type StringSelectMenuInteraction
} from 'discord.js'

export async function setPresence (interaction: ModalSubmitInteraction<CacheType>): Promise<void> {
  const { fields, guildId } = interaction
  const fieldNames = ['msg1', 'msg2', 'msg3']

  let data = await db.messages.get(`${guildId}.system.status.messages`)
  if (data === undefined || data === Object || data === '' || data === null) {
    data = []
  }
  console.log(data)
  for (const fieldName of fieldNames) {
    const message = fields.getTextInputValue(fieldName)

    if (message !== null && message !== '') {
      data.push(message)
    }
  }
  await db.messages.set(`${guildId}.system.status.messages`, data)
  console.log(await db.messages.get(`${guildId}.system.status.messages`))

  await interaction.reply({ content: '✅ | Modal enviado com sucesso!', ephemeral: true })
}

export async function delModalPresence (interaction: StringSelectMenuInteraction<CacheType>): Promise<void> {
  const { user, guildId } = interaction

  const values = await db.messages.get(`${guildId}.system.status.messages`)
  const deleteValues = interaction.values.map(Number)

  const updatedValues = values.filter((_: any, index: any) => !deleteValues.includes(index))
  await db.messages.set(`${guildId}.system.status.messages`, updatedValues)
  console.log(await db.messages.get(`${guildId}.system.status.messages`))
  await interaction.reply({ content: `User ${user.username} selecionou os valores: ${deleteValues.map(v => `> ${v}`).join('\n')}`, ephemeral: true })
}
