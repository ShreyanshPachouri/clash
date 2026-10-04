import { Router, type Request, type Response} from "express";
import { loginSchema, registerSchema } from "../validations/authValidation.js";
import {  ZodError } from "zod";
import prisma from "../config/database.js";
import bcrypt from "bcrypt"
import { v4 as uuid4 } from "uuid"
import { renderEmailEjs, formatError } from "../helper.js";
import { emailQueue, emailQueueName } from "../jobs/EmailJob.js";
import jwt from "jsonwebtoken"
import authMiddleware from "../middleware/AuthMiddleware.js";
import { authLimiter } from "../config/rateLimit.js";

const router = Router()

//login routes
router.post("/login", authLimiter, async(req: Request, res: Response) => {
    try{
        const body = req.body
        const payload = loginSchema.parse(body)

        let user = await prisma.user.findUnique({
            where: {
                email: payload.email
            }
        })

        if(!user || user === null){
            return res.status(422).json({ errors: {
                email: "Email not found."
            }})
        }

        const compare = await bcrypt.compare(payload.password, user.password)

        if(!compare){
            return res.status(422).json({ errors: {
                email: "Password or email is incorrect."
            }})
        }

        let JWTPayload = {
            id: user.id,
            name: user.name,
            email: user.email
        }
        
        const token = jwt.sign(JWTPayload, process.env.JWT_SECRET as string, { expiresIn: "365d" })

        return res.json({ message: "Login successful", 
            data: {
                ...JWTPayload,
                token: `Bearer ${token}`
            }
        })

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

router.post("/check/credentials", authLimiter, async(req: Request, res: Response) => {
    try{
        const body = req.body
        const payload = loginSchema.parse(body)

        let user = await prisma.user.findUnique({
            where: {
                email: payload.email
            }
        })

        if(!user || user === null){
            return res.status(422).json({ errors: {
                email: "Email not found."
            }})
        }

        const compare = await bcrypt.compare(payload.password, user.password)

        if(!compare){
            return res.status(422).json({ errors: {
                email: "Password or email is incorrect."
            }})
        }

        return res.json({ message: "Login successful", 
            data: {}
        })

    } catch(error){
        if(error instanceof ZodError){
            const errors = formatError(error)
            return res.status(422).json({ messages: "Invalid format", errors})
        }

        console.log(error)
        return res.status(500).json({ message: "Something went wrong.", error})
    }
})

//auth routes
router.post("/register", authLimiter, async(req: Request, res: Response) => {
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

router.get("/user", authMiddleware, async(req: Request, res: Response) => {
    const user = req.user
    return res.json({ message: "User fetched successfully", data: user })
})

export default router