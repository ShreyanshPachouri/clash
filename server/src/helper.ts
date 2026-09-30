import ejs from "ejs";
import type { ZodError } from "zod";
import path from 'path'
import { fileURLToPath } from "url"

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