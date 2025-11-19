import "dotenv/config";
import { REST, Routes } from "discord.js";

// Deine 3 Commands direkt hier definieren:
const commands = [
    {
        name: "ping",
        description: "Check bot status"
    },
    {
        name: "profil",
        description: "Show helper profile",
        options: [
            {
                name: "user",
                description: "Select a user",
                type: 6, // USER
                required: true
            }
        ]
    },
    {
        name: "review",
        description: "Submit a review",
        options: [
            {
                name: "user",
                description: "User you want to rate",
                type: 6,
                required: true
            },
            {
                name: "stars",
                description: "Rating from 1 to 5",
                type: 4, // INTEGER
                required: true,
                choices: [
                    { name: "⭐ 1", value: 1 },
                    { name: "⭐⭐ 2", value: 2 },
                    { name: "⭐⭐⭐ 3", value: 3 },
                    { name: "⭐⭐⭐⭐ 4", value: 4 },
                    { name: "⭐⭐⭐⭐⭐ 5", value: 5 }
                ]
            },
            {
                name: "category",
                description: "Review category",
                type: 3, // STRING
                required: true,
                choices: [
                    { name: "Ingame", value: "Ingame" },
                    { name: "Support", value: "Support" },
                    { name: "Voice", value: "Voice" },
                    { name: "Chat", value: "Chat" },
                    { name: "Ticket", value: "Ticket" },
                    { name: "Other", value: "Other" }
                ]
            },
            {
                name: "comment",
                description: "Optional comment",
                type: 3,
                required: false
            }
        ]
    }
];

const rest = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN);

(async () => {
    try {
        console.log("Registering slash commands...");
        await rest.put(
            Routes.applicationCommands(process.env.APP_ID),
            { body: commands }
        );
        console.log("✔ Slash commands registered successfully.");
    } catch (err) {
        console.error("Error registering commands:", err);
    }
})();
