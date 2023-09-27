import { db } from '@/app'
import {
  ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle, type CommandInteraction,
  type CacheType,
  StringSelectMenuBuilder,
  type ButtonInteraction
} from 'discord.js'

export async function modelPresence (interaction: CommandInteraction<'cached'> | ButtonInteraction<CacheType>): Promise<void> {
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
