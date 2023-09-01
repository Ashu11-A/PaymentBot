import { Command } from '@/structs/types/Command'
import { brBuilder, calculateImageSize, formatBytes } from '@/utils/Format'
import { ApplicationCommandOptionType, ApplicationCommandType, EmbedBuilder, codeBlock } from 'discord.js'

const arrayTamanho = [16, 32, 64, 128, 256, 512, 1024, 2048, 4096]
const tamanhoChoices = arrayTamanho.map(size => ({
  name: String(size),
  value: String(size)
}))
export default new Command({
  name: 'servericon',
  description: 'Mostra o icone do servidor',
  type: ApplicationCommandType.ChatInput,
  options: [
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
      const size: any = Number(options.getString('tamanho')) ?? 4096
      const img = interaction.guild?.iconURL({ size })
      const tamanho = await calculateImageSize(String(img))

      const embed = new EmbedBuilder()
        .setColor('Blue')
        .setAuthor({ name: String(interaction.guild?.name), iconURL: String(interaction.guild?.iconURL({ size: 64 })) })
        .setDescription(`**Click [aqui](${String(img)}) para baixar a imagem**\n**Tamanho: ${formatBytes(tamanho)}**`)
        .setImage(String(img))

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
