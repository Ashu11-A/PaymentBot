import { db } from '@/app'
import { gen } from '@/functions'
import { type ModalSubmitInteraction, type CacheType, EmbedBuilder } from 'discord.js'
import { sendDM } from '../functions/sendDM'
import { validator } from '../functions/validator'
import { Pterodactyl } from '@/classes/pterodactyl'
import axios, { type AxiosError } from 'axios'
import { type UserObject } from '@/classes/interfaces'

export async function createAccount (options: {
  interaction: ModalSubmitInteraction<CacheType>
  key: string
}): Promise<void> {
  const { interaction } = options
  if (!interaction.inGuild() || !interaction.inCachedGuild()) return

  try {
    const { guildId, user, fields } = interaction
    const email = fields.getTextInputValue('email')
    const username = fields.getTextInputValue('username')
    const firtName = fields.getTextInputValue('primeiro-nome')
    const lastName = fields.getTextInputValue('ultimo-nome')
    const password = gen(12)
    const dataPost = {
      email,
      username,
      first_name: firtName,
      last_name: lastName
    }

    console.log(email, username, firtName, lastName)
    const { url: urlPtero, tokenPanel: tokenPtero } = (await db.payments.get(
      `${guildId}.config.pterodactyl`
    )) ?? { url: undefined, tokenPanel: undefined }
    if (await validator({ email, interaction, token: tokenPtero, url: urlPtero })) return
    const PterodactylBuilder = new Pterodactyl({ url: urlPtero, token: tokenPtero })

    const embedError = new EmbedBuilder({
      title: '❌ | Ocorreu um erro ao tentar criar o usuário no Pterodactyl.'
    }).setColor('Red')

    async function showError (err: any | AxiosError<any, any> | undefined): Promise<boolean> {
      if (createRes === undefined || axios.isAxiosError(createRes)) {
        const errorInfo: Array<Record<string, Error | string>> = []

        if (err?.cause !== undefined) errorInfo.push({ Cause: err.cause })
        if (err?.name !== undefined) errorInfo.push({ Erro: err.name })
        if (err?.message !== undefined) errorInfo.push({ Message: err.message })
        if (err?.response?.data?.errors[0]?.detail !== undefined) {
          errorInfo.push({ Detail: err.response.data.errors[0].detail })
        }

        if (errorInfo.length > 0) {
          const description = errorInfo
            .map((erro) => {
              const chave = Object.keys(erro)[0]
              const valor = erro[chave]
              return `${chave}: ${valor instanceof Error ? valor.message : valor}`
            })
            .join('\n')
          embedError.setDescription(description)
          await interaction.reply({
            ephemeral,
            embeds: [embedError]
          })
          return true
        }
      }
      return false
    }

    const createRes = await PterodactylBuilder.user({ type: 'create', data: dataPost })
    if (await showError(createRes)) return

    const { attributes: { id, uuid } } = createRes as UserObject

    const setPassword = await PterodactylBuilder.user({ type: 'update', userId: id, data: { ...dataPost, password } })
    if (await showError(setPassword)) {
      const deleteRes = await PterodactylBuilder.user({ type: 'delete', userId: id })
      if (await showError(deleteRes)) {
        await interaction.reply({
          ephemeral,
          embeds: [
            new EmbedBuilder({
              title:
                '❌ | Chame um Administrador, ao tentar definir a senha da sua conta, ocorreu um erro, mas ao tentar então deletar a conta para uma nova tentativa, não foi possivel deletar a conta.'
            })
          ]
        })
      }
      if (deleteRes === 204) {
        await interaction.reply({
          ephemeral,
          embeds: [
            new EmbedBuilder({
              title: '❌ | Ocorreu um erro ao tentar definir a senha da sua conta, tente novamente!'
            })
          ]
        })
      }
    } else {
      await db.pterodactyl.table('guilds').set(`${guildId}.users.${user.id}`, {
        id,
        uuid
      })
      await sendDM({ email, interaction, password, url: urlPtero })
    }
  } catch (err) {
    console.log(err)
    await interaction.reply({
      ephemeral,
      embeds: [
        new EmbedBuilder({
          title: '❌ | Ocorreu um erro ao fazer a solicitação ao Painel!'
        }).setColor('Red')
      ]
    })
  }
}
