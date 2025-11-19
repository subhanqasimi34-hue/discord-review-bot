import "dotenv/config";
import express from "express";
import { Client, GatewayIntentBits } from "discord.js";
import { verifyKeyMiddleware } from "discord-interactions";
import handler from "./src/handler.js";
import connectDB from "./src/database/db.js";

// --- 1) Start Gateway (Bot online) ---
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once("ready", () => {
  console.log(`Bot online als ${client.user.tag}`);
});

client.login(process.env.BOT_TOKEN);

// --- 2) Start Webserver (Slash Commands) ---
connectDB();

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).send("Bot is running on Koyeb");
});

app.post(
  "/interactions",
  verifyKeyMiddleware(process.env.PUBLIC_KEY),
  handler
);

app.listen(process.env.PORT || 3000, () =>
  console.log("Server live on port " + (process.env.PORT || 3000))
);
