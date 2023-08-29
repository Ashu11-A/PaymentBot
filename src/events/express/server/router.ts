import { Router } from 'express'
import { Root } from '../routes/home'

const router: Router = Router()

router.get('*', Root.get)

export { router }
