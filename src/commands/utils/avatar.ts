import { Command } from '@/structs/types/Command'
import { brBuilder, calculateImageSize, formatBytes } from '@/utils/Format'
import { ApplicationCommandOptionType, ApplicationCommandType, EmbedBuilder, codeBlock } from 'discord.js'

const arrayTamanho = [16, 32, 64, 128, 256, 512, 1024, 2048, 4096]
const tamanhoChoices = arrayTamanho.map(size => ({
  name: String(size),
  value: String(size)
}))
export default new Command({
  name: 'avatar',
  description: '[ 🪄 Utilidades ] Mostra o avatar do usuário selecionado',
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'usuário',
      description: 'Selecionar usuário',
      type: ApplicationCommandOptionType.User,
      required: false
    },
    {
      name: 'tamanho',
      description: 'Tamanho da Imagem',
      type: ApplicationCommandOptionType.String,
      choices: tamanhoChoices,
      required: false
    }
  ],
  async run ({ interaction, options }) {
    await interaction.deferReply()

    try {
      const user = options.getUser('usuário')
      const size: any = Number(options.getString('tamanho')) ?? 2048
      const img = user?.avatarURL({ size }) ?? interaction.user.avatarURL({ size })
      const tamanho = await calculateImageSize(String(img))

      const embed = new EmbedBuilder()
        .setColor('Random')
        .setTitle('Click aqui para baixar')
        .setDescription(`Tamanho da imagem: ${formatBytes(tamanho)}`)
        .setImage(String(img))
        .setURL(String(img))

      await interaction.editReply({
        embeds: [embed]
      })
    } catch (err) {
      await interaction.editReply({
        content: brBuilder('Ocorreu um erro', codeBlock('ts', String(err)))
      })
    }
  }
})
