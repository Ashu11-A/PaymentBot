import { Router } from "express"
import { Root } from "../routers/home"

const router: Router = Router()

router.get("*", Root.get)

export { router }