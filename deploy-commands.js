import "dotenv/config";
import fetch from "node-fetch";

// Deine Commands hier eintragen
const commands = [
    {
        name: "ping",
        description: "Replies with Pong!",
    },
    {
        name: "profil",
        description: "Zeigt dein Profil an."
    }
];

const DISCORD_APPLICATION_ID = process.env.APPLICATION_ID; 
const DISCORD_BOT_TOKEN = process.env.BOT_TOKEN;

if (!DISCORD_APPLICATION_ID || !DISCORD_BOT_TOKEN) {
    console.error("❌ ERROR: APPLICATION_ID oder BOT_TOKEN fehlen in .env");
    process.exit(1);
}

async function registerCommands() {
    try {
        console.log("📡 Registering slash commands...");

        const response = await fetch(
            `https://discord.com/api/v10/applications/${DISCORD_APPLICATION_ID}/commands`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bot ${DISCORD_BOT_TOKEN}`
                },
                body: JSON.stringify(commands)
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error("❌ Fehler beim Registrieren:", data);
            return;
        }

        console.log("✅ Slash commands registered successfully!");
    } catch (err) {
        console.error("❌ ERROR:", err);
    }
}

registerCommands();
