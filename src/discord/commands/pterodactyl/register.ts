import { db } from '@/app'
import { Command } from '@/discord/base'
import { validarEmail } from '@/functions'
import axios from 'axios'
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  EmbedBuilder
} from 'discord.js'

new Command({
  name: 'registro',
  nameLocalizations: {
    'en-US': 'register'
  },
  description: '[ 🦖 Pterodactyl] Registro',
  descriptionLocalizations: {
    'en-GB': '[ 🦖 Pterodactyl] Register'
  },
  dmPermission,
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'email',
      description: 'Email para acesso ao Painel',
      type: ApplicationCommandOptionType.String,
      required: true
    },
    {
      name: 'username',
      description: 'Nome de Usuário',
      type: ApplicationCommandOptionType.String,
      required: true
    },
    {
      name: 'primeiro-nome',
      description: 'Será usado para os registro de pagamentos!',
      type: ApplicationCommandOptionType.String,
      required: true
    },
    {
      name: 'último-nome',
      description: 'Será usado para os registro de pagamentos!',
      type: ApplicationCommandOptionType.String,
      required: true
    }
  ],
  async run (interaction) {
    if (!interaction.inCachedGuild()) return
    await interaction.deferReply({ ephemeral })

    const { options, guildId, user: { id: userId } } = interaction
    const email = options.getString('email', true)
    const username = options.getString('username', true)
    const firtName = options.getString('primeiro-nome', true)
    const lastName = options.getString('último-nome', true)

    const user = await db.pterodactyl.get(`${guildId}.users.${userId}`) ?? undefined
    if (user !== undefined) {
      return await interaction.editReply({
        embeds: [new EmbedBuilder({
          title: '⚠️ | Atenção, você já tem uma conta, caso use esse comando novamente em um curto periodo de tempo, será penalizado com uma restrinção a sua conta ou até o banimento permanentemente caso seja detectado tentativas de fraudes ou ações irregulares!'
        }).setColor('Red')]
      })
    }

    const { url, tokenPanel } = await db.payments.get(
      `${guildId}.config.pterodactyl`
    ) ?? { url: undefined, tokenPanel: undefined }
    if (url === undefined || tokenPanel === undefined) {
      return await interaction.editReply({
        embeds: [
          new EmbedBuilder({
            title:
              '❌ | URL ou Token do pterodactyl não está configurado, tente `/config pterodactyl`'
          }).setColor('Red')
        ]
      })
    }

    const [isValid, msg] = validarEmail(email)
    if (!isValid) {
      return await interaction.editReply({
        embeds: [new EmbedBuilder({ title: msg }).setColor('Red')]
      })
    }

    await axios({
      url: `${url}/api/application/users`,
      method: 'POST',
      maxRedirects: 5,
      data: {
        email,
        username,
        first_name: firtName,
        last_name: lastName
      },
      headers: {
        Accept: 'Application/vnd.pterodactyl.v1+json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenPanel}`
      }
    }).then(async (res) => {
      if (res.status === 201) {
        const { attributes: { id, uuid, created_at: createdAt } } = res.data
        await db.pterodactyl.set(`${guildId}.users.${userId}`, {
          id,
          uuid,
          createdAt
        })

        await interaction.editReply({
          embeds: [
            new EmbedBuilder({
              title: `👋 Olá ${firtName}, sua conta foi criada com sucesso em nosso Painel, agora você pode usar os comandos /perfil, /planos e muito mais!`
            }).setColor('Green')
          ]
        })
      } else {
        await interaction.editReply({
          embeds: [new EmbedBuilder({
            title: `❌ | Não foi possível criar a conta, erro: ${res.statusText} | ${res.status}`
          }).setColor('Red')]
        })
      }
    }).catch(async (err) => {
      await interaction.editReply({
        embeds: [new EmbedBuilder({
          title: `❌ | ${err.response.data.errors[0].detail ?? 'Ocorreu um erro ao fazer a solicitação ao Painel!'}`
        }).setColor('Red')]
      })
      console.log(err.response.data.errors[0].detail)
    })
  }
})
