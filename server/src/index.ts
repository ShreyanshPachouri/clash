import express, { type Application, type Request, type Response } from "express"
import "dotenv/config"
const app: Application = express()
const PORT = process.env.PORT || 7000

app.get("/", (req: Request, res: Response) => {
    res.send("Hey, it is working")
})

app.listen(PORT, () => console.log(`Server is running on PORT ${PORT}`))