import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const COMMANDS = [
    {
        name: "ping",
        description: "Replies with Pong!",
        type: 1
    }
];

async function registerCommands() {
    try {
        const url = `https://discord.com/api/v10/applications/${process.env.CLIENT_ID}/commands`;

        const response = await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bot ${process.env.BOT_TOKEN}`
            },
            body: JSON.stringify(COMMANDS)
        });

        if (!response.ok) {
            const text = await response.text();
            console.error("❌ Discord API Error:", text);
            return;
        }

        console.log("✅ Slash commands registered successfully!");
    } catch (err) {
        console.error("❌ Failed to register commands:", err);
    }
}

registerCommands();
