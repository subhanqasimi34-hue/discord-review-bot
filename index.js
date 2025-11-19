require("dotenv").config();
const fs = require("fs");
const path = require("path");
const {
    Client,
    GatewayIntentBits,
    Collection,
    REST,
    Routes
} = require("discord.js");

const connectDB = require("./src/database/db");

// Discord Client
const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

// Command Collection
client.commands = new Collection();

// Load commands from /src/commands
const commandsPath = path.join(__dirname, "src/commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));
const slashCommands = [];

for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    if ("data" in command && "execute" in command) {
        client.commands.set(command.data.name, command);
        slashCommands.push(command.data.toJSON());
        console.log(`✔ Loaded command: ${command.data.name}`);
    } else {
        console.log(`❌ Invalid command skipped: ${file}`);
    }
}

client.once("ready", async () => {
    console.log(`🤖 Logged in as ${client.user.tag}`);
    
    // Connect to MongoDB
    await connectDB();

    const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

    try {
        console.log("🧹 Clearing OLD commands...");
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: [] }
        );

        console.log("✨ Registering NEW commands...");
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: slashCommands }
        );

        console.log("✅ Commands registered!");
    } catch (error) {
        console.error("❌ Error uploading commands:", error);
    }
});

// Command Handler
client.on("interactionCreate", async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (err) {
        console.error(err);
        if (interaction.replied || interaction.deferred) {
            return interaction.followUp({
                content: "There was an error while executing this command.",
                flags: 64
            });
        }

        return interaction.reply({
            content: "There was an error while executing this command.",
            flags: 64
        });
    }
});

// Login
client.login(process.env.DISCORD_TOKEN);
