import { Router, type Request, type Response } from 'express';
import { ZodError } from 'zod';
import { formatError, imageValidator, removeImage, uploadFile } from '../helper.js';
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
            return res.status(422).json({errors: { message: "Image is required." }})
        }

        await prisma.clash.create({
            data: {
                title: payload.title,
                description: payload?.description!,
                image: payload?.image,
                user_id: req.user?.id!,
                expire_at: new Date(payload.expire_at),
            }
        })

        return res.json({ message: "Clash created successfully!" });
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

router.get("/", async(req: Request, res: Response) => {
    try{
        const clash = await prisma.clash.findMany({
            where: {
                user_id: req.user?.id!
            }
        })

        return res.json({ message: "Clash fetched successfully!", data: clash });
    }

    catch(error){
        return res.status(500).json({ message: "Something went wrong.", error})
    }
})

router.get("/:id", async(req: Request, res: Response) => {
    try{
        const { id } = req.params;

        const clash = await prisma.clash.findUnique({
            where: {
                id: Number(id)
            }
        })

        return res.json({ message: "Clash fetched successfully!", data: clash });
    }

    catch(error){
        return res.status(500).json({ message: "Something went wrong.", error})
    }
})

router.put("/:id", async (req: Request, res: Response) => {
    try{
        const { id } = req.params;
        const body = req.body;
        const payload = clashSchema.parse(body);

        if(req.files?.image){
            const image = req.files?.image as UploadedFile;
            const validMsg = imageValidator(image.size, image.mimetype);

            if(validMsg){
                return res.status(422).json({ message: validMsg })
            }

            const clash = await prisma.clash.findUnique({
                select: {
                    image: true,
                    id: true
                },

                where: {
                    id: Number(id)
                }
            })

            if(clash){
                removeImage(clash.image)
            }

            payload.image = await uploadFile(image);
        }

        await prisma.clash.update({
            where: {
                id: Number(id)
            },

            data: {
                ...payload,
                expire_at: new Date(payload.expire_at)
            }
        })

        return res.json({ message: "Clash updated successfully!" });
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

router.delete("/:id", async(req: Request, res: Response) => {
    try{
        const { id } = req.params;

        const clash = await prisma.clash.findUnique({
            select: {
                image: true,
                id: true
            },
            
            where: {
                id: Number(id)
            }
        })

        if(clash){
            removeImage(clash?.image)
        }

        await prisma.clash.delete({
            where: {
                id: Number(id)
            }
        })

        return res.json({ message: "Clash deleted successfully!", data: clash });
    }

    catch(error){
        return res.status(500).json({ message: "Something went wrong.", error})
    }
})

export default router;