import { Discord } from '@/functions'
import collectorModal from './configCollector/collectorModal'

const modalConfig = {
  mcConfig: {}
}

Object.entries(modalConfig).map(async ([key, value]) => {
  await Discord.registerComponent({
    customId: key,
    type: 'Modal',
    async run (modalInteraction) {
      const isModal = (value as { modal?: boolean })?.modal ?? true
      if (isModal) {
        await collectorModal(modalInteraction)
      }
    }
  })
})
