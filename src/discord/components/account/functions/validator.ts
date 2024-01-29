import { validarEmail } from '@/functions'
import { EmbedBuilder, type CacheType, type ModalSubmitInteraction } from 'discord.js'

export async function validator (options: {
  url: string
  token: string
  email: string
  interaction: ModalSubmitInteraction<CacheType>
}): Promise<boolean> {
  const { email, interaction, token, url } = options

  if (url === undefined || token === undefined) {
    console.log('❌ | URL ou Token do pterodactyl não está configurado, tente `/config pterodactyl`')
    await interaction.reply({
      embeds: [
        new EmbedBuilder({
          title: '❌ | URL ou Token do pterodactyl não está configurado, tente `/config pterodactyl`'
        }).setColor('Red')
      ]
    })
    return true
  }

  const [isValid, msg] = validarEmail(email)
  if (!isValid) {
    console.log(msg)
    await interaction.reply({
      ephemeral,
      embeds: [new EmbedBuilder({ title: msg }).setColor('Red')]
    })
    return true
  }
  return false
}
