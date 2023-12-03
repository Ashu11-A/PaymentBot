import { Command } from '@/discord/base'
import { calculateImageSize, formatBytes } from '@/functions'
import { brBuilder } from '@magicyan/discord'
import { ActionRowBuilder, ApplicationCommandOptionType, ApplicationCommandType, ButtonBuilder, ButtonStyle, EmbedBuilder, codeBlock } from 'discord.js'

const arrayTamanho = [16, 32, 64, 128, 256, 512, 1024, 2048, 4096]
const tamanhoChoices = arrayTamanho.map(size => ({
  name: String(size),
  value: String(size)
}))
new Command({
  name: 'servericon',
  description: '[ 🪄 Utilidades ] Mostra o icone do servidor',
  dmPermission,
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
  async run (interaction) {
    await interaction.deferReply()
    const { options, guild, member } = interaction

    try {
      const size: any = Number(options.getString('tamanho')) ?? 4096
      const img = guild?.iconURL({ size }) as string
      const tamanho = await calculateImageSize(String(img))

      const embed = new EmbedBuilder({
        author: { iconURL: img, name: guild?.name ?? member?.user.username ?? 'Error' }
      }).setColor('Blue')
        .setImage(img)

      const button = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder({
          emoji: { name: '🔗' },
          label: `Baixar Imagem (${formatBytes(tamanho)})`,
          url: img,
          style: ButtonStyle.Link
        })
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
