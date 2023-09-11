import { Command } from '@/structs/types/Command'
import { brBuilder, calculateImageSize, formatBytes } from '@/utils/Format'
import { ActionRowBuilder, ApplicationCommandOptionType, ApplicationCommandType, ButtonBuilder, ButtonStyle, EmbedBuilder, codeBlock } from 'discord.js'

const arrayTamanho = [16, 32, 64, 128, 256, 512, 1024, 2048, 4096]
const tamanhoChoices = arrayTamanho.map(size => ({
  name: String(size),
  value: String(size)
}))
export default new Command({
  name: 'servericon',
  description: '[ 🪄 Utilidades ] Mostra o icone do servidor',
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
      const img = interaction.guild?.iconURL({ size }) as string
      const tamanho = await calculateImageSize(String(img))

      const embed = new EmbedBuilder()
        .setColor('Blue')
        .setAuthor({ iconURL: img, name: interaction.guild?.name as string })
        .setImage(img)

      const button = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setEmoji('🔗')
          .setLabel(`Baixar Imagem (${formatBytes(tamanho)})`)
          .setURL(img)
          .setStyle(ButtonStyle.Link)
      )

      await interaction.editReply({
        embeds: [embed],
        components: [button]
      })
    } catch (err) {
      await interaction.editReply({
        content: brBuilder('Ocorreu um erro', codeBlock('ts', String(err)))
      })
    }
  }
})
