import { delay } from '@/functions'
import { type TextChannel, type Collection, type Message, type NewsChannel, type PrivateThreadChannel, type PublicThreadChannel, type StageChannel, type VoiceChannel, type Attachment } from 'discord.js'
import { NtTelegram } from './telegram'

export default class NtDiscord {
  name: string
  token: string
  guildId: string
  requestDelay: number
  channel: NewsChannel | StageChannel | TextChannel | PrivateThreadChannel | PublicThreadChannel | VoiceChannel
  context: { lastReportedMsgId: string, msgContentHash: Record<string, string> }

  constructor (
    name: string,
    token: string,
    guildId: string,
    requestDelay: number,
    channel: NewsChannel | StageChannel | TextChannel | PrivateThreadChannel | PublicThreadChannel | VoiceChannel,
    context: { lastReportedMsgId: string, msgContentHash: Record<string, string> }
  ) {
    this.name = name
    this.token = token
    this.guildId = guildId
    this.channel = channel
    this.context = context
    this.requestDelay = requestDelay
  }

  /**
   * Inicia o Processo
   */
  public async startChannelMonitoring (): Promise<void> {
    const { requestDelay, name, token, guildId } = this

    while (true) {
      try {
        const messages = await this.getMessagesToReport()

        if (messages !== undefined) {
          // Formatar respostas
          function formatMessage (messages: Collection<string, Message<boolean>>): string {
            return `${messages.reduce(
            (prev, curr) =>
              prev +
              `\n[${new Date(curr.createdTimestamp).toLocaleString()}] ${curr.author.username}: ${curr.content}${
                (curr.attachments.size !== 0) ? parsedAttachments(curr.attachments) : ''
              }`,
            ''
          )}`
          }

          function parsedAttachments (attachments: Collection<string, Attachment>): string {
            return attachments.reduce((prev, curr) => prev + `\n${curr.url}`, '\n[Attachments]:')
          }

          const formattedMessage = formatMessage(messages)
          const telegram = new NtTelegram(token, guildId)
          if (formattedMessage.length > 0) await telegram.notifySubscribers(`${name}\n${formattedMessage}`)

          await delay(requestDelay)
        }
      } catch (e: any) {
        console.log(`Request failed: ${e.message}`)
      }
    }
  }

  /**
   * Consulta as informações e as filtra
   */
  public async getMessagesToReport (): Promise<Collection<string, Message<true>> | undefined> {
    const { channel, context } = this

    if (channel !== null) {
      const latestMessages = await channel.messages.fetch({ limit: 5 })
      // Filtragem
      const messagesToReport = latestMessages.filter(
        (m) => {
          const messageId = m.id
          return (messageId > context.lastReportedMsgId || hashCode(m.content) !== context.msgContentHash[m.id])
        }
      )
      context.lastReportedMsgId = messagesToReport.first()?.id ?? context.lastReportedMsgId

      latestMessages.forEach((m) => (context.msgContentHash[m.id] = hashCode(m.content)))
      return messagesToReport
    } else {
      return undefined
    }

    function hashCode (s: string): any {
      s.split('').reduce((a: number, b: string) => {
        a = (a << 5) - a + b.charCodeAt(0)
        return a & a
      }, 0)
    }
  }
}
