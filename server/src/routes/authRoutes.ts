import { Router, type Request, type Response} from "express";
import { registerSchema } from "../validations/authValidation.js";
import {  ZodError } from "zod";
import prisma from "../config/database.js";
import bcrypt from "bcrypt"
import { v4 as uuid4 } from "uuid"
import { renderEmailEjs, formatError } from "../helper.js";
import { emailQueue, emailQueueName } from "../jobs/EmailJob.js";

const router = Router()

//auth routes
router.post("/register", async(req: Request, res: Response) => {
   try{
        const body = req.body
        const payload = registerSchema.parse(body)

        let user = await prisma.user.findUnique({
            where: {
                email: payload.email
            }
        })

        if(user){
            return res.status(422).json({ errors: {
                email: "Email already exists. Please use another one."
            }})
        }

        const salt = await bcrypt.genSalt(10)
        payload.password = await bcrypt.hash(payload.password, salt)

        const token = await bcrypt.hash(uuid4(), salt)
        const url = `${process.env.APP_URL}/verify-email?email=${payload.email}&token=${token}`
        const emailBody = await renderEmailEjs("email-verify", { name: payload.name, url: url})

        await emailQueue.add(emailQueueName, { to: payload.email, subject: "Clash Email Verification", body: emailBody})

        await prisma.user.create({
            data: {
                name: payload.name,
                email: payload.email,
                password: payload.password,
                email_verify_token: token
            }
        })

        return res.json({ message:"Please check verification email"})
    } catch(error){
        if(error instanceof ZodError){
            const errors = formatError(error)
            return res.status(422).json({ messages: "Invalid format", errors})
        }

        return res.status(500).json({ message: "Something went wrong.", error})
    }
})

export default router