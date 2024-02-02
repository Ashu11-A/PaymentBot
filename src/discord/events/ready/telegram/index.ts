import { client, db } from '@/app'
import NtDiscord from './functions/discord'
import { NtTelegram } from './functions/telegram'

export async function telegramNotify (): Promise<void> {
  for (const [guildId, guild] of client.guilds.cache) {
    const { name, channels } = guild
    const channel = await channels.fetch('846152746587258900')
    const token = await db.guilds.get(`${guildId}.config.telegram.token`) as string | undefined

    if (channel !== null && channel.isTextBased()) {
      if (token !== undefined) {
        const ntTelegramInstance = new NtTelegram(
          token,
          guildId
        )
        void ntTelegramInstance.setTgBotEvents()

        const ntDiscordInstance = new NtDiscord(
          name,
          token,
          guildId,
          5000,
          channel,
          { lastReportedMsgId: '0', msgContentHash: {} }
        )
        void ntDiscordInstance.startChannelMonitoring()
      }
    }
  }
}
