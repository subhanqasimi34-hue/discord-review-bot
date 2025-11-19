import express from "express";
import handler from "./src/handler.js";
import { verifyKeyMiddleware } from "discord-interactions";
import dotenv from "dotenv";

dotenv.config();

import connectDB from "./src/database/db.js"; 
connectDB();

const app = express();

// Nur hier JSON erlauben
app.get("/", (req, res) => {
    res.send("Bot running.");
});

// Wichtig: KEIN express.json() vor /interactions !!!

app.post(
    "/interactions",
    express.raw({ type: "application/json" }), // raw body
    verifyKeyMiddleware(process.env.PUBLIC_KEY),
    handler
);

app.use(express.json()); // alle anderen Routen

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server live on port ${PORT}`));
