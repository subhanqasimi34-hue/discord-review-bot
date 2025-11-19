import "dotenv/config";
import express from "express";
import { Client, GatewayIntentBits } from "discord.js";
import { verifyKeyMiddleware } from "discord-interactions";
import handler from "./src/handler.js";
import connectDB from "./src/database/db.js";

// ------------------------------
// 1) Discord Bot Gateway (ONLINE)
// ------------------------------
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once("ready", () => {
    console.log(`🤖 Bot online als: ${client.user.tag}`);
});

client.login(process.env.BOT_TOKEN);

// ------------------------------
// 2) MongoDB
// ------------------------------
connectDB();

// ------------------------------
// 3) Webserver + Slash Commands
// ------------------------------
const app = express();

// Root
app.get("/", (req, res) => {
    res.send("Bot running on Koyeb.");
});

// WICHTIG: raw body FÜR DISCORD
app.post(
    "/interactions",
    express.raw({ type: "application/json" }),
    verifyKeyMiddleware(process.env.PUBLIC_KEY),
    handler
);

// Andere Routen dürfen JSON haben
app.use(express.json());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
    console.log(`🌍 Server live on port ${PORT}`)
);
