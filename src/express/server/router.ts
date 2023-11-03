import { Router } from 'express'
import { readdirSync, statSync } from 'fs'
import path from 'path'
import { Root as notFoundRouter } from '../routes/home'
import { loggingMiddleware, corsMiddleware, fuckFavicon } from './middleware'

const router: Router = Router()

router.use(corsMiddleware)
router.use(fuckFavicon)
router.use(loggingMiddleware)

async function scanRoutes (folderPath: string, router: Router, prefix = ''): Promise<void> {
  const files = readdirSync(folderPath)

  for (const file of files) {
    const filePath = path.join(folderPath, file)
    const stat = statSync(filePath)

    if (stat.isDirectory()) {
      // Se for um diretório, continue a recursão
      await scanRoutes(filePath, router, path.join(prefix, file))
    } else if (file.endsWith('.ts')) {
      try {
        // Importe o módulo de rota
        const routeModule = await import(filePath)
        const { Root } = routeModule // Acesse o objeto Root do módulo importado
        const fileFormat = file.replace('.ts', '')
        let route: string = path.join(prefix, fileFormat).split('\\').join('/')

        if (fileFormat === 'index') {
          route = route.replace('index', '')
        }

        ['get', 'post', 'delete', 'put'].forEach((method: string) => {
          if (Root?.[method] !== undefined) {
            (router as Record<string, any>)[method](`/${route}`, Root[method])
          }
        })
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
