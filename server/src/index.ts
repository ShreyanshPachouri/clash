import express, { type Application, type Request, type Response } from "express"
import "dotenv/config"
import path from 'path'
import { fileURLToPath } from "url"
import ejs from "ejs"
import Routes from "./routes/index.js"
import fileUpload from "express-fileupload"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app: Application = express()
const PORT = process.env.PORT || 7000

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(limiter)
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/'
}))

app.set("view engine", "ejs")
app.set("views", path.resolve(__dirname, './views'))
app.use(Routes)

app.get("/", async(req: Request, res: Response) => {
    const html = await ejs.renderFile(__dirname + `/views/emails/welcome.ejs`, { name: "Shreyansh Pachouri"})
    await emailQueue.add(emailQueueName, { to: "hoyesin903@omanarts.com", subject: "Testing queue email", body: html})
    return res.json({ msg: "Email sent successfully"})
})

import './jobs/index.js'
import { emailQueue, emailQueueName } from "./jobs/EmailJob.js"
import { limiter } from "./config/rateLimit.js"
app.listen(PORT, () => console.log(`Server is running on PORT ${PORT}`))

