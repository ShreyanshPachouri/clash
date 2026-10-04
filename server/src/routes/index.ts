import { Router } from "express"
import AuthRoutes from "./authRoutes.js"
import VerifyRoutes from './verifyRoutes.js'
import passwordRoutes from "./passwordRoutes.js"
import clashRoutes from "./clashRoutes.js"
import authMiddleware from "../middleware/AuthMiddleware.js"

const router = Router()
router.use('/api/auth', AuthRoutes)
router.use('/', VerifyRoutes)
router.use('/api/auth', passwordRoutes)
router.use('/api/clash', authMiddleware, clashRoutes)

export default router