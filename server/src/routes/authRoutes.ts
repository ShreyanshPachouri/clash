import { Router, type Request, type Response} from "express";
import { registerSchema } from "../validations/authValidation.js";
import { formatError, ZodError } from "zod";
import prisma from "../config/database.js";
import bcrypt from "bcrypt"
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

        await prisma.user.create({
            data: {
                name: payload.name,
                email: payload.name,
                password: payload.password
            }
        })

        return res.json({ message: "Account created successfully"})
    } catch(error){
        if(error instanceof ZodError){
            const errors = formatError(error)
            return res.status(422).json({ messages: "Invalid format", errors})
        }

        return res.status(500).json({ message: "Something went wrong.", error})
    }
})

export default router