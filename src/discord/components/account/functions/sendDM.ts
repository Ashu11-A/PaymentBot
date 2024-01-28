import { createRow } from '@magicyan/discord'
import { ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder, type CacheType, type ModalSubmitInteraction } from 'discord.js'

export async function sendDM (options: {
  interaction: ModalSubmitInteraction<CacheType>
  email: string
  password: string
  url: string
}): Promise<void> {
  const { email, interaction, password, url } = options
  if (!interaction.inGuild() || !interaction.inCachedGuild()) return
  const { user, guild } = interaction
  const icon = (guild.iconURL({ size: 2048 }) as string) ?? undefined

  await interaction.reply({
    ephemeral,
    embeds: [
      new EmbedBuilder({
        title: `👋 Olá ${user.username}, olhe seu PV para obter acesso ao painel, agora você pode usar os comandos \`/perfil\`, \`/planos\` e muito mais!`
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
          url,
          emoji: { name: '🔗' },
          label: 'Painel',
          style: ButtonStyle.Link,
          type: ComponentType.Button
        })
      )
    ]
  })
}
