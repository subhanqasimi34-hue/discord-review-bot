import "dotenv/config";
import express from "express";
import { Client, GatewayIntentBits, Partials, REST, Routes } from "discord.js";
import { verifyKeyMiddleware } from "discord-interactions";
import mongoose from "mongoose";

// ================================
// 1. MongoDB
// ================================
async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("🍃 MongoDB connected");
    } catch (err) {
        console.error("❌ MongoDB error:", err);
        process.exit(1);
    }
}
connectDB();

// ================================
// 2. Discord Gateway (Bot Online)
// ================================
const client = new Client({
    intents: [GatewayIntentBits.Guilds],
    partials: [Partials.Channel]
});

client.once("ready", () => {
    console.log(`🤖 Bot online as ${client.user.tag}`);
});

// Bot Login
client.login(process.env.BOT_TOKEN);

// ================================
// 3. Slash Commands Registrierung
// ================================
async function registerCommands() {
    const commands = [
        {
            name: "ping",
            description: "Antwortet mit Pong!"
        }
    ];

    const rest = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN);

    try {
        await rest.put(
            Routes.applicationCommands(process.env.APP_ID),
            { body: commands }
        );
        console.log("✔️ Slash Commands registriert.");
    } catch (err) {
        console.error("❌ Command Registration Error:", err);
    }
}
registerCommands();

// ================================
// 4. Express Webserver + Webhook
// ================================
const app = express();

// Health Check (UptimeRobot + Koyeb)
app.get("/", (req, res) => {
    res.send("Bot running ✔️");
});

app.post(
    "/interactions",
    express.raw({ type: "application/json" }),
    verifyKeyMiddleware(process.env.PUBLIC_KEY),
    async (req, res) => {
        const interaction = JSON.parse(req.body.toString());
        console.log("📩 Interaction received:", interaction.type);

        // PING → Discord Webhook-Test
        if (interaction.type === 1) {
            return res.json({ type: 1 });
        }

        // Slash command
        if (interaction.type === 2) {
            const command = interaction.data.name;

            if (command === "ping") {
                return res.json({
                    type: 4,
                    data: { content: "🏓 Pong! (Webhook OK)" }
                });
            }

            return res.json({
                type: 4,
                data: { content: "❔ Unbekannter Command." }
            });
        }

        res.status(400).send("Unknown interaction type.");
    }
);

// JSON Parser für alles nach /interactions
app.use(express.json());

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🌐 Express live on port ${PORT}`));
