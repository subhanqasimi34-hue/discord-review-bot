import 'dotenv/config';
import { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } from 'discord.js';
import mongoose from 'mongoose';

// ---------- MongoDB ----------
mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log("🍃 MongoDB connected");
}).catch(err => console.error(err));

// ---------- Discord Client ----------
const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.once('ready', () => {
    console.log(`🤖 Bot online as ${client.user.tag}`);
});

// ---------- Slash Commands ----------
const commands = [
    new SlashCommandBuilder().setName('ping').setDescription('Ping test'),
    new SlashCommandBuilder().setName('profile')
        .setDescription('Show a user profile')
        .addUserOption(o => o.setName('user').setDescription('Target user').setRequired(true)),
    new SlashCommandBuilder().setName('review')
        .setDescription('Submit a review')
        .addUserOption(o => o.setName('user').setDescription('User to review').setRequired(true))
        .addIntegerOption(o => o.setName('stars').setDescription('1-5 stars').setRequired(true))
        .addStringOption(o => o.setName('category').setDescription('Category').setRequired(true))
        .addStringOption(o => o.setName('comment').setDescription('Comment').setRequired(false))
].map(cmd => cmd.toJSON());

// ---------- Register Commands ----------
(async () => {
    const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);
    await rest.put(Routes.applicationCommands(process.env.APP_ID), { body: commands });
    console.log("✔ Slash commands registered");
})();

// ---------- Command Handler ----------
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'ping') {
        return interaction.reply('🏓 Pong!');
    }

    if (interaction.commandName === 'profile') {
        const user = interaction.options.getUser('user');
        return interaction.reply(`📘 Profile for ${user.username}`);
    }

    if (interaction.commandName === 'review') {
        const stars = interaction.options.getInteger('stars');
        const user = interaction.options.getUser('user');
        const cat = interaction.options.getString('category');
        const comment = interaction.options.getString('comment') ?? "No comment.";

        return interaction.reply(`⭐ Review submitted for ${user.username}
Stars: ${stars}
Category: ${cat}
Comment: ${comment}`);
    }
});

client.login(process.env.BOT_TOKEN);
