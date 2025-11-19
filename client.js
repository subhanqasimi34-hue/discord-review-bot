import { Client, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";

dotenv.config();

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.once("ready", () => {
    console.log(`🤖 Bot logged in as ${client.user.tag}`);
});

client.login(process.env.TOKEN);
