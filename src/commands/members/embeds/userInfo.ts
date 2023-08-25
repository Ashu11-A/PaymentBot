import { EmbedBuilder } from 'discord.js'

export default function userInfo(member: any) {
  const user = member.user
  const embed = new EmbedBuilder()
    .setTitle('Informações do usuário')
    .addFields(
      { name: 'Nome', value: user.username },
      { name: 'ID', value: user.id },
      {
        name: 'Entrou no servidor em',
        value: member.joinedAt.toLocaleDateString('pt-BR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })
      },
      {
        name: 'Conta criada em',
        value: user.createdAt.toLocaleDateString('pt-BR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })
      }
    )
    .setColor("Aqua")
    .setThumbnail(user.avatarURL({ dynamic: true }))
    .setTimestamp()

  return embed
}
