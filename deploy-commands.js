import "dotenv/config";
import { REST, Routes } from "discord.js";
import fs from "fs";

const commands = [];

const commandFiles = fs.readdirSync("./src/commands").filter(f => f.endsWith(".js"));
for (const file of commandFiles) {
    const cmd = await import(`./src/commands/${file}`);
    commands.push(cmd.data);
}

const rest = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN);

try {
    console.log("Registering Slash Commands...");
    await rest.put(
        Routes.applicationCommands(process.env.APP_ID),
        { body: commands }
    );
    console.log("✔ Slash Commands Registered.");
} catch (err) {
    console.error(err);
}
