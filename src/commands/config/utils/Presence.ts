import { db } from '@/app'
import {
  ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle, type CommandInteraction,
  type ModalSubmitInteraction,
  type CacheType
  , type StringSelectMenuInteraction,
  StringSelectMenuBuilder
} from 'discord.js'

export async function modelPresence (interaction: CommandInteraction<'cached'>): Promise<void> {
  const modal = new ModalBuilder({ custom_id: 'MessagePresence', title: 'Messages for Presence' })
  const input1 = new ActionRowBuilder<TextInputBuilder>({
    components: [
      new TextInputBuilder({
        custom_id: 'msg1',
        label: 'Primeira mensagem',
        placeholder: 'Digite uma mensagem aqui.',
        style: TextInputStyle.Short,
        required: false,
        value: 'Em desenvolvimento...'
      })
    ]
  })

  const input2 = new ActionRowBuilder<TextInputBuilder>({
    components: [
      new TextInputBuilder({
        custom_id: 'msg2',
        label: 'Segunda mensagem',
        placeholder: 'Sabia que você pode colocar quantas mensagens quiser?.',
        style: TextInputStyle.Short,
        required: false,
        value: 'Criado por Ashu....'
      })
    ]
  })

  const input3 = new ActionRowBuilder<TextInputBuilder>({
    components: [
      new TextInputBuilder({
        custom_id: 'msg3',
        label: 'Terceira mensagem',
        placeholder: 'Só rodar ele novamente, e se quiser apagar, rode o Remover.',
        style: TextInputStyle.Short,
        required: false
      })
    ]
  })

  modal.setComponents(input1, input2, input3)

  await interaction.showModal(modal)
}

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

export async function delPresence (interaction: CommandInteraction<'cached'>): Promise<void> {
  const dataDb = await db.messages.get(`${interaction.guildId}.system.status.messages`)
  const options: Array<{ label: string, description: string, value: string, emoji: string }> = []
  let number = 0
  dataDb.forEach((message: string, index: number) => {
    number += 1
    options.push({
      label: `Mensagem ${index + 1}`,
      description: message,
      value: String(index),
      emoji: '📝'
    })
  })
  const row = new ActionRowBuilder<StringSelectMenuBuilder>({
    components: [
      new StringSelectMenuBuilder({
        custom_id: 'messagesStatusArray',
        placeholder: 'Selecione as mensagens que deseja deletar',
        minValues: 1,
        maxValues: number,
        options
      })
    ]
  })
  await interaction.reply({
    components: [row],
    ephemeral: true
  })
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
