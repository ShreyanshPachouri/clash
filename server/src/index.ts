import express, { type Application, type Request, type Response } from "express"
import "dotenv/config"
import path from 'path'
import { fileURLToPath } from "url"
import ejs from "ejs"
import { sendMail } from "./config/mail.js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app: Application = express()
const PORT = process.env.PORT || 7000

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.set("view engine", "ejs")
app.set("views", path.resolve(__dirname, './views'))

app.get("/", async(req: Request, res: Response) => {
    const html = await ejs.renderFile(__dirname + `/views/emails/welcome.ejs`, { name: "Shreyansh Pachouri"})
    
    await sendMail("dicogi6040@omanarts.com", "Testing SMTP", html)
    return res.json({ msg: "Email sent successfully"})
})

import './jobs/index.js'
app.listen(PORT, () => console.log(`Server is running on PORT ${PORT}`))