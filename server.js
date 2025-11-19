import express from "express";
import handler from "./src/handler.js";
import { verifyKeyMiddleware } from "discord-interactions";
import dotenv from "dotenv";

dotenv.config();

import connectDB from "./src/database/db.js";
connectDB();

const app = express();

// Entfernen für /interactions → WICHTIG
app.use(express.json());

// Alive endpoint
app.get("/", (req, res) => {
  res.status(200).send("Bot is running via Koyeb.");
});

// Richtiger Interactions-Endpoint ohne express.json()
app.post(
  "/interactions",
  express.raw({ type: "*/*" }),       // ✨ RAW BODY, damit Discord unterschreiben kann
  verifyKeyMiddleware(process.env.PUBLIC_KEY),
  handler
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server live on port ${PORT}`));
