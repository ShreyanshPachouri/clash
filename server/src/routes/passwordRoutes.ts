import { Router, type Request, type Response } from "express"
import prisma from "../config/database.js"
import { authLimiter } from "../config/rateLimit.js"
import { ZodError } from "zod"
import { checkDateHourDifference, formatError, renderEmailEjs } from "../helper.js"
import { forgetPasswordSchema, resetPasswordSchema } from "../validations/passwordValidation.js"
import bcrypt from "bcrypt"
import { v4 as uuidv4 } from "uuid"
import { emailQueue, emailQueueName } from "../jobs/EmailJob.js"

const router = Router()

router.post("/forget-password", authLimiter, async (req: Request, res: Response) => {
    try{
        const body = req.body
        const payload = forgetPasswordSchema.parse(body)

        let user = await prisma.user.findUnique({
            where: {
                email: payload.email
            }
        })

        if(!user || user === null){
            return res.status(422).json({ message: "Invalid data", errors:{
                email: "Email not found."
            }})
        }

        const salt = await bcrypt.genSalt(10)
        const token = await bcrypt.hash(uuidv4(), salt)

        await prisma.user.update({
            where: {
                email: payload.email
            },

            data: {
                password_reset_token: token,
                token_send_at: new Date().toISOString()
            }
        })

        const url = `${process.env.CLIENT_APP_URL}/reset-password?email=${payload.email}&token=${token}`
        const html = await renderEmailEjs("forget-password", { name: user.name, url: url })

        await emailQueue.add(emailQueueName, { to: payload.email, subject: "Reset Password", body: html})

        return res.json({ message: "Reset password link sent to your email."})
    }
    
    catch(error){
        if(error instanceof ZodError){
            const errors = formatError(error)
            return res.status(422).json({ message: "Invalid format", errors})
        }
    
        console.log(error)
        return res.status(500).json({ message: "Something went wrong.", error})
    }
})

router.post("/reset-password", async(req: Request, res: Response) => {
    try{
        const body = req.body
        const payload = resetPasswordSchema.parse(body)

        let user = await prisma.user.findUnique({
            where: {
                email: payload.email
            }
        })

        if(!user || user === null){
            return res.status(422).json({ message: "Invalid data", errors:{
                email: "Email not found."
            }})
        }

        if(user.password_reset_token !== payload.token){
            return res.status(422).json({ message: "Invalid data", errors:{
                token: "Invalid token."
            }})
        }

        const hoursDiff = checkDateHourDifference(user.token_send_at!)

        if(hoursDiff > 2){
            return res.status(422).json({ message: "Invalid data", errors:{
                token: "Token expired."
            }})
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(payload.password, salt)

        await prisma.user.update({
            where: {
                email: payload.email
            },
            data: {
                password: hashedPassword,
                password_reset_token: null,
                token_send_at: null
            }
        })

        return res.json({ message: "Password reset successfully."})
    }

    catch(error){
        if(error instanceof ZodError){
            const errors = formatError(error)
            return res.status(422).json({ messages: "Invalid format", errors})
        }
    
        console.log(error)
        return res.status(500).json({ message: "Something went wrong.", error})
    }
})

export default router