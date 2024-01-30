import axios, { type AxiosError } from 'axios'
import { EmbedBuilder, type CacheType, type ModalSubmitInteraction } from 'discord.js'

export async function showError (options: {
  res: any | AxiosError<any, any> | undefined
  interaction: ModalSubmitInteraction<CacheType>
}): Promise<boolean> {
  const embedError = new EmbedBuilder({
    title: '❌ | Ocorreu um erro ao tentar criar o usuário no Pterodactyl.'
  }).setColor('Red')
  const { res, interaction } = options
  if (res === undefined || axios.isAxiosError(res)) {
    const errorInfo: Array<Record<string, Error | string>> = []

    if (res?.cause !== undefined) errorInfo.push({ Cause: res.cause })
    if (res?.name !== undefined) errorInfo.push({ Erro: res.name })
    if (res?.message !== undefined) errorInfo.push({ Message: res.message })
    if (res?.response?.data?.errors[0]?.detail !== undefined) {
      errorInfo.push({ Detail: res.response.data.errors[0].detail })
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
