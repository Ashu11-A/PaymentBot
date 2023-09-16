import { Router } from 'express'
import { readdirSync, statSync } from 'fs'
import path from 'path'

import { Root as notFoundRouter } from '../routes/home'
import { loggingMiddleware } from './loggingMiddleware'

const router: Router = Router()

router.use(loggingMiddleware)

async function scanRoutes (folderPath: string, router: Router): Promise<void> {
  const files = readdirSync(folderPath)

  for (const file of files) {
    const filePath = path.join(folderPath, file)
    const stat = statSync(filePath)

    if (stat.isDirectory()) {
      // Se for um diretório, continue a recursão
      await scanRoutes(filePath, router)
    } else if (file.endsWith('.ts')) {
      try {
        // Importe o módulo de rota
        const routeModule = await import(filePath)
        const { Root } = routeModule // Acesse o objeto Root do módulo importado

        if (Root?.get !== undefined) {
          router.get(`/${file.replace('.ts', '')}`, Root.get) // Use o método get do objeto Root
        }
        if (Root?.post !== undefined) {
          router.post(`/${file.replace('.ts', '')}`, Root.post) // Use o método post do objeto Root
        }
      } catch (err) {
        console.error(err)
      }
    }
  }
}

void scanRoutes(path.join(__dirname, '../routes'), router)
  .then(() => {
    router.use('*', notFoundRouter.get)
  })

export { router }
