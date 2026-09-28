import express, { type Application, type Request, type Response } from "express"
import "dotenv/config"
import path from 'path'
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app: Application = express()
const PORT = process.env.PORT || 7000

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.set("view engine", "ejs")
app.set("views", path.resolve(__dirname, './views'))

app.get("/", (req: Request, res: Response) => {
    res.render("welcome")
})

app.listen(PORT, () => console.log(`Server is running on PORT ${PORT}`))