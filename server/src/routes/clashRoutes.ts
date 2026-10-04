import { Router, type Request, type Response } from 'express';
import { ZodError } from 'zod';
import { formatError, imageValidator, uploadFile } from '../helper.js';
import { clashSchema } from '../validations/clashValidation.js';
import type { UploadedFile } from 'express-fileupload';
import prisma from '../config/database.js';

const router = Router();

router.post("/", async (req: Request, res: Response) => {
    try{
        const body = req.body;
        const payload = clashSchema.parse(body);

        if(req.files?.image){
            const image = req.files?.image as UploadedFile;
            const validMsg = imageValidator(image.size, image.mimetype);

            if(validMsg){
                return res.status(422).json({ message: validMsg })
            }

            payload.image = await uploadFile(image);
        }

        else{
            return res.status(422).json({ message: "Image is required." })
        }

        await prisma.clash.create({
            data: {
            ...payload,
            user_id : req.user?.id!,
            expire_at : new Date(payload.expire_at)
            }
        })
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

export default router;