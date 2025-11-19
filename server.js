import express from "express";
import handler from "./src/handler.js"; // falls vorhanden
import { verifyKeyMiddleware } from "discord-interactions";
import dotenv from "dotenv";

dotenv.config();

// korrekter DB import
import connectDB from "./src/database/db.js"; 
connectDB();

const app = express();
app.use(express.json());

// Alive
app.get("/", (req, res) => {
    res.status(200).send("Bot is running via Koyeb.");
});

// Discord interactions
app.post(
    "/interactions",
    verifyKeyMiddleware(process.env.PUBLIC_KEY),
    handler
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server live on port ${PORT}`));
