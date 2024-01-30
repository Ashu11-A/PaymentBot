import { db } from '@/app'
import { gen } from '@/functions'
import { EmbedBuilder, type CacheType, type ModalSubmitInteraction } from 'discord.js'
import { sendDM } from '../functions/sendDM'
import { validator } from '../functions/validator'
import { CtrlPanel } from '@/classes/ctrlPanel'
import { showError } from '../functions/showError'
import { type UserData } from '@/classes/interfacesCtrl'

export async function createAccount (options: {
  interaction: ModalSubmitInteraction<CacheType>
  key: string
}): Promise<void> {
  const { interaction } = options
  if (!interaction.inGuild() || !interaction.inCachedGuild()) return

  try {
    const { guildId, user, fields } = interaction
    const { url: urlCtrl, token: tokenCtrl } = await db.payments.get(`${guildId}.config.ctrlPanel`)

    const email = fields.getTextInputValue('email')
    const username = fields.getTextInputValue('username')
    const password = gen(12)

    if (await validator({ email, interaction, token: tokenCtrl, url: urlCtrl })) return

    const CtrlPanelBuilder = new CtrlPanel({ url: urlCtrl, token: tokenCtrl })

    const dataPost = {
      name: username,
      email,
      password
    }
    console.log(dataPost)

    const createUser = await CtrlPanelBuilder.createUser({ data: dataPost })
    console.log(createUser)
    if (await showError({ interaction, res: createUser })) return
    console.log(createUser)
    const { id, pterodactyl_id: pterodactylId } = createUser as UserData
    await db.ctrlPanel.table('guilds').set(`${guildId}.users.${user.id}`, {
      id,
      pterodactylId
    })
    await sendDM({ email, interaction, password, url: urlCtrl })
  } catch (err) {
    await interaction.reply({
      ephemeral,
      embeds: [
        new EmbedBuilder({
          title: 'Ocorreu um erro ao fazer a solicitação ao Painel!'
        }).setColor('Red')
      ]
    })
  }
}
