import { db } from '@/app'
import { gen } from '@/functions'
import axios from 'axios'
import { EmbedBuilder, type CacheType, type ModalSubmitInteraction } from 'discord.js'
import { sendDM } from '../functions/sendDM'
import { validator } from '../functions/validator'

export async function createAccount (options: {
  interaction: ModalSubmitInteraction<CacheType>
  key: string
}): Promise<void> {
  const { interaction } = options
  if (!interaction.inGuild() || !interaction.inCachedGuild()) return

  const { guildId, user, fields } = interaction
  const { url: urlCtrl, token: tokenCtrl } = await db.payments.get(`${guildId}.config.ctrlPanel`)

  const email = fields.getTextInputValue('email')
  const username = fields.getTextInputValue('username')
  const password = gen(12)

  if (!await validator({ email, interaction, token: tokenCtrl, url: urlCtrl })) return

  await axios({
    url: `${urlCtrl}/api/users`,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${tokenCtrl}`
    },
    data: {
      name: username,
      email,
      password
    }
  })
    .then(async (res) => {
      console.log(res)
      const { id, pterodactyl_id: pterodactylId } = res.data
      await db.ctrlPanel.table('guilds').set(`${guildId}.users.${user.id}`, {
        id,
        pterodactylId
      })
      await sendDM({ email, interaction, password, url: urlCtrl })
    })
    .catch(async (err) => {
      await interaction.reply({
        ephemeral,
        embeds: [
          new EmbedBuilder({
            title: `❌ | ${err?.response?.data?.message ??
              'Ocorreu um erro ao fazer a solicitação ao Painel!'
              }`
          }).setColor('Red')
        ]
      })
    })
}
