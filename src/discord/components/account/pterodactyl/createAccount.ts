import { db } from '@/app'
import { validarEmail, gen } from '@/functions'
import { createRow } from '@magicyan/discord'
import axios from 'axios'
import { type ModalSubmitInteraction, type CacheType, EmbedBuilder, ButtonBuilder, ButtonStyle, ComponentType } from 'discord.js'

export async function createAccount (options: {
  interaction: ModalSubmitInteraction<CacheType>
  key: string
}): Promise<void> {
  const { interaction } = options
  if (!interaction.inGuild() || !interaction.inCachedGuild()) return

  const { guild, guildId, user, fields } = interaction
  const icon = (guild.iconURL({ size: 2048 }) as string) ?? undefined
  const email = fields.getTextInputValue('email')
  const username = fields.getTextInputValue('username')
  const firtName = fields.getTextInputValue('primeiro-nome')
  const lastName = fields.getTextInputValue('ultimo-nome')

  const { url: urlPtero, tokenPanel: tokenPtero } = (await db.payments.get(
    `${guildId}.config.pterodactyl`
  )) ?? { url: undefined, tokenPanel: undefined }

  const userDB =
      (await db.pterodactyl.get(`${guildId}.users.${user.id}`)) ?? undefined
  if (userDB === undefined) {
    await interaction.reply({
      embeds: [
        new EmbedBuilder({
          title:
              '⚠️ | Atenção, você já tem uma conta, caso use esse comando novamente em um curto periodo de tempo, será penalizado com uma restrinção a sua conta ou até o banimento permanentemente caso seja detectado tentativas de fraudes ou ações irregulares!'
        }).setColor('Red')
      ]
    })
    return
  }

  if (urlPtero === undefined || tokenPtero === undefined) {
    await interaction.reply({
      embeds: [
        new EmbedBuilder({
          title:
              '❌ | URL ou Token do pterodactyl não está configurado, tente `/config pterodactyl`'
        }).setColor('Red')
      ]
    })
    return
  }

  const [isValid, msg] = validarEmail(email)
  if (!isValid) {
    await interaction.reply({
      ephemeral,
      embeds: [new EmbedBuilder({ title: msg }).setColor('Red')]
    })
    return
  }

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
          attributes: { id, uuid, created_at: createdAt }
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
            await db.pterodactyl.set(`${guildId}.users.${user.id}`, {
              id,
              uuid,
              createdAt
            })

            await interaction.reply({
              ephemeral,
              embeds: [
                new EmbedBuilder({
                  title: `👋 Olá ${firtName}, olhe seu PV para obter acesso ao painel, agora você pode usar os comandos \`/perfil\`, \`/planos\` e muito mais!`
                }).setColor('Green')
              ]
            })
            await user.send({
              embeds: [
                new EmbedBuilder({
                  title: 'Seu Acesso ao Painel',
                  fields: [
                    { name: 'Email:', value: email },
                    { name: 'Senha:', value: password }
                  ],
                  author: {
                    name: user.username,
                    iconURL: user.avatarURL({ size: 64 }) ?? undefined
                  },
                  thumbnail: { url: icon },
                  footer: {
                    text: `Equipe ${guild.name}`,
                    iconURL: icon
                  }
                }).setColor('White')
              ],
              components: [
                createRow(
                  new ButtonBuilder({
                    url: urlPtero,
                    emoji: { name: '🔗' },
                    label: 'Painel',
                    style: ButtonStyle.Link,
                    type: ComponentType.Button
                  })
                )
              ]
            })
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
            title: `❌ | ${
                err.response.data.errors[0].detail ??
                'Ocorreu um erro ao fazer a solicitação ao Painel!'
              }`
          }).setColor('Red')
        ]
      })
      console.log(err.response.data.errors[0].detail)
    })
}
