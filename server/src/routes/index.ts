import { Router } from "express"
import AuthRoutes from "./authRoutes.js"
import VerifyRoutes from './verifyRoutes.js'
import passwordRoutes from "./passwordRoutes.js"

const router = Router()
router.use('/api/auth', AuthRoutes)
router.use('/', VerifyRoutes)
router.use('/api/auth', passwordRoutes)

export default router