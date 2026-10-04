import ejs from "ejs";
import type { ZodError } from "zod";
import path from 'path'
import { fileURLToPath } from "url"
import moment from "moment"
import { supportedMimes } from "../src/config/filesystem.js"
import { v4 as uuid4 } from "uuid"
import type { UploadedFile } from "express-fileupload";

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const formatError = (error: ZodError): any => {
    let errors: any = {}

    error.issues?.map((issue) => {
        errors[issue.path?.[0]] = issue.message
    })

    return errors
}

export const renderEmailEjs = async (fileName: string, payload: any): Promise<string> => {
    const html: string = await ejs.renderFile(__dirname + `/views/emails/${fileName}.ejs`, payload)

    return html
}

export const checkDateHourDifference = (date: Date | string): number => {
  const now = moment();
  const tokenSentAt = moment(date);
  const difference = moment.duration(now.diff(tokenSentAt));
  const hoursDiff = difference.asHours();
  return hoursDiff;
};

export const bytesToMb = (bytes: number): number => {
    return bytes / (1024 * 1024);
}

export const imageValidator = (size: number, mime: string): string | null => {
    if(bytesToMb(size) > 2){
        return "File size should not exceed 2MB."
    }

    else if(!supportedMimes.includes(mime)){
        return "File type is not supported."
    }

    return null;
}

export const uploadFile = async(image: UploadedFile) => {
    const imgExt = image?.name.split('.')
    const imageName = uuid4() + "." + imgExt[1]
    const uploadPath = process.cwd() + "/public/images" + imageName

    image.mv(uploadPath, (err) => {
        if(err){
            console.log(err)
            throw new Error("Something went wrong while uploading the file.")
        }
    })

    return imageName
}