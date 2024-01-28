import { db } from '@/app'
import { gen } from '@/functions'
import axios from 'axios'
import { type ModalSubmitInteraction, type CacheType, EmbedBuilder } from 'discord.js'
import { sendDM } from '../functions/sendDM'
import { validator } from '../functions/validator'

export async function createAccount (options: {
  interaction: ModalSubmitInteraction<CacheType>
  key: string
}): Promise<void> {
  const { interaction } = options
  if (!interaction.inGuild() || !interaction.inCachedGuild()) return

  const { guildId, user, fields } = interaction
  const email = fields.getTextInputValue('email')
  const username = fields.getTextInputValue('username')
  const firtName = fields.getTextInputValue('primeiro-nome')
  const lastName = fields.getTextInputValue('ultimo-nome')

  const { url: urlPtero, tokenPanel: tokenPtero } = (await db.payments.get(
    `${guildId}.config.pterodactyl`
  )) ?? { url: undefined, tokenPanel: undefined }

  if (!await validator({ email, interaction, token: tokenPtero, url: urlPtero })) return

  const dataPost = {
    email,
    username,
    first_name: firtName,
    last_name: lastName
  }

  await axios({
    url: `${urlPtero}/api/application/users`,
    method: 'POST',
    maxRedirects: 5,
    data: dataPost,
    headers: {
      Accept: 'Application/vnd.pterodactyl.v1+json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenPtero}`
    }
  })
    .then(async (res) => {
      if (res.status === 201) {
        const {
          attributes: { id, uuid }
        } = res.data
        const password = gen(12)

        await axios({
          url: `${urlPtero}/api/application/users/${id}`,
          method: 'PATCH',
          maxRedirects: 5,
          data: {
            ...dataPost,
            password
          },
          headers: {
            Accept: 'Application/vnd.pterodactyl.v1+json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${tokenPtero}`
          }
        })
          .then(async () => {
            await db.pterodactyl.table('guilds').set(`${guildId}.users.${user.id}`, {
              id,
              uuid
            })
            await sendDM({ email, interaction, password, url: urlPtero })
          })
          .catch(async (err) => {
            console.log(err)
            await axios({
              url: `${urlPtero}/api/application/users/${id}`,
              method: 'DELETE',
              maxRedirects: 5,
              headers: {
                Accept: 'Application/vnd.pterodactyl.v1+json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${tokenPtero}`
              }
            })
              .then(async () => {
                const embed = new EmbedBuilder({
                  title:
                    '❌ | Ocorreu um erro ao tentar definir a senha da sua conta, tente novamente!'
                }).setColor('Red')
                if (err?.response?.data?.errors[0]?.detail !== undefined) {
                  embed.addFields({
                    name: 'Erro:',
                    value: err.response.data.errors[0].detail
                  })
                }
                await interaction.reply({
                  ephemeral,
                  embeds: [embed]
                })
              })
              .catch(async (err) => {
                console.log(err)
                await interaction.reply({
                  ephemeral,
                  embeds: [
                    new EmbedBuilder({
                      title:
                        '❌ | Chame um Administrador, ao tentar definir a senha da sua conta, ocorreu um erro, mas ao tentar então deletar a conta para uma nova tentativa, não foi possivel deletar a conta.'
                    })
                  ]
                })
              })
          })
      } else {
        await interaction.reply({
          ephemeral,
          embeds: [
            new EmbedBuilder({
              title: `❌ | Não foi possível criar a conta, erro: ${res.statusText} | ${res.status}`
            }).setColor('Red')
          ]
        })
      }
    })
    .catch(async (err) => {
      await interaction.reply({
        ephemeral,
        embeds: [
          new EmbedBuilder({
            title: `❌ | ${err?.response?.data?.errors[0]?.detail ??
              'Ocorreu um erro ao fazer a solicitação ao Painel!'
              }`
          }).setColor('Red')
        ]
      })
      console.log(err.response.data.errors[0].detail)
    })
}
