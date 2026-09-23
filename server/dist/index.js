import express, {} from "express";
import "dotenv/config";
const app = express();
const PORT = process.env.PORT || 7000;
app.get("/", (req, res) => {
    res.send("Hey, it is working");
});
app.listen(PORT, () => console.log(`Server is running on PORT ${PORT}`));
