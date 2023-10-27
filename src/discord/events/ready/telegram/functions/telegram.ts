import { db } from '@/app'
import TelegramBot from 'node-telegram-bot-api'

export class NtTelegram {
  token: string
  guildId: string

  constructor (
    token: string,
    guildId: string
  ) {
    this.token = token
    this.guildId = guildId
  }

  /**
   * Começa o bot no Telegram
   */
  public async setTgBotEvents (): Promise<void> {
    const { token } = this
    const bot = new TelegramBot(this.token, { polling: true })

    console.log(token, bot)

    try {
      bot.onText(/\/start/, async (msg: { chat: { id: number } }) => {
        const chatId = msg.chat.id
        bot.sendMessage(chatId, 'Use /sub para se inscrever')
      })

      bot.onText(/\/sub/, async (msg: { chat: { id: number } }) => {
        const chatId = msg.chat.id
        console.log(chatId)
        // await addSubscriber(chatId)
        bot.sendMessage(chatId, 'Concluído.')
      })
    } catch (error) {
      console.log(error)
    }
  }

  /**
   * Envia a notificação para o Telegram
   */
  public async notifySubscribers (message: string): Promise<void> {
    const { guildId } = this
    try {
      const subs = await db.telegram.table('subscribers').get(guildId)
      if (subs !== null) {
        for (const sub of subs) {
          console.log(sub)
        }
      }
    } catch (error) {
      console.log(error)
    }
  }
}
