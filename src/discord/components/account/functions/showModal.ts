import {
  ActionRowBuilder,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  type ButtonInteraction,
  type CacheType
} from 'discord.js'
import { getModalData } from './getModalData'
import { db } from '@/app'

export async function showModal (options: {
  interaction: ButtonInteraction<CacheType>
  key: string
}): Promise<void> {
  const { interaction, key } = options
  const { customId, guildId, user } = interaction
  const info = getModalData(key)
  const modal = new ModalBuilder({ customId, title: 'Pterodactyl Registro' })

  const userDB = (await db[key === 'Pterodactyl' ? 'pterodactyl' : 'ctrlPanel'].table('guilds').get(`${guildId}.users.${user.id}`)) ?? undefined
  if (userDB !== undefined) {
    await interaction.reply({
      ephemeral,
      embeds: [
        new EmbedBuilder({
          title: '⚠️ | Atenção, você já tem uma conta, caso use esse comando novamente em um curto periodo de tempo, será penalizado com uma restrinção a sua conta ou até o banimento permanentemente caso seja detectado tentativas de fraudes ou ações irregulares!'
        }).setColor('Red')
      ]
    })
    return
  }

  const contentData = new Array<ActionRowBuilder<TextInputBuilder>>()

  for (const [position, values] of info.entries()) {
    const { label, maxLength, placeholder, style, customId, type } = values
    if (!(contentData[position] instanceof ActionRowBuilder)) {
      contentData[position] = new ActionRowBuilder<TextInputBuilder>()
    }
    contentData[position].addComponents(
      new TextInputBuilder({
        label,
        placeholder,
        style,
        maxLength,
        required: true,
        customId,
        type
      })
    )
  }

  modal.setComponents(contentData)
  await interaction.showModal(modal)
}
