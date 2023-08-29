import { client, core } from '@/app'
import { Event } from '@/structs/types/Event'

export default new Event({
  name: 'ready',
  once: true,
  run () {
    const { commands, buttons, selects, modals } = client

    core.info('✅ Bot online'.green)
    core.info(`✅ Commands carregados: ${commands.size}`.cyan)
    core.info(`✅ Buttons carregados: ${buttons.size}`.cyan)
    core.info(`✅ Selects carregados: ${selects.size}`.cyan)
    core.info(`✅ Moldals carregados: ${modals.size}`.cyan)
  }
})
