import express from "express";
import { Client, GatewayIntentBits } from "discord.js";
import { verifyKeyMiddleware } from "discord-interactions";
import dotenv from "dotenv";
import connectDB from "./src/database/db.js";
import handler from "./src/handler.js";

dotenv.config();

// ----------------------------------------
// 1) MongoDB
// ----------------------------------------
connectDB();

// ----------------------------------------
// 2) Discord Gateway Client (macht Bot ONLINE)
// ----------------------------------------
const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.once("ready", () => {
    console.log(`🤖 Bot is online as ${client.user.tag}`);
});

client.login(process.env.TOKEN);

// ----------------------------------------
// 3) Express Webhook Server (/interactions)
// ----------------------------------------
const app = express();

// DISCORD BRAUCHT RAW BODY
app.post(
    "/interactions",
    express.raw({ type: "application/json" }),
    verifyKeyMiddleware(process.env.PUBLIC_KEY),
    handler
);

// Alive Check
app.get("/", (req, res) => {
    res.send("Bot + Webhook + Gateway are running on Koyeb.");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🌐 Server läuft auf Port ${PORT}`));
