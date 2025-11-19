import "dotenv/config";
import { Client, GatewayIntentBits, REST, Routes, EmbedBuilder } from "discord.js";
import mongoose from "mongoose";

// =============================================
// =============== DATABASE =====================
// =============================================

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("🍃 MongoDB connected"))
  .catch(err => console.error("❌ MongoDB Error:", err));

const userSchema = new mongoose.Schema({
    userId: String,
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    averageRating: { type: Number, default: 0 },
    reviewsCount: { type: Number, default: 0 }
});

const reviewSchema = new mongoose.Schema({
    reviewerId: String,
    targetId: String,
    guildId: String,
    stars: Number,
    category: String,
    comment: String,
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model("User", userSchema);
const Review = mongoose.model("Review", reviewSchema);

// =============================================
// =============== DISCORD BOT =================
// =============================================

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.once("ready", () => {
    console.log(`🤖 Bot online as ${client.user.tag}`);
});

// =============================================
// ========= REGISTER SLASH COMMANDS ===========
// =============================================

const commands = [
    {
        name: "ping",
        description: "Check bot latency"
    },
    {
        name: "profile",
        description: "See a user's profile",
        options: [
            {
                name: "user",
                description: "User to check",
                type: 6,
                required: true
            }
        ]
    },
    {
        name: "review",
        description: "Submit a review for someone",
        options: [
            {
                name: "user",
                type: 6,
                description: "Person you want to review",
                required: true
            },
            {
                name: "stars",
                type: 4,
                description: "Rating (1–5)",
                required: true,
                choices: [
                    { name: "⭐", value: 1 },
                    { name: "⭐⭐", value: 2 },
                    { name: "⭐⭐⭐", value: 3 },
                    { name: "⭐⭐⭐⭐", value: 4 },
                    { name: "⭐⭐⭐⭐⭐", value: 5 }
                ]
            },
            {
                name: "category",
                type: 3,
                description: "Review category",
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
                type: 3,
                description: "Optional comment",
                required: false
            }
        ]
    }
];

async function registerCommands() {
    const rest = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN);
    await rest.put(Routes.applicationCommands(process.env.APP_ID), { body: commands });
    console.log("✅ Slash commands registered globally.");
}
registerCommands();

// =============================================
// =============== COMMAND HANDLER =============
// =============================================

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    // /ping
    if (interaction.commandName === "ping") {
        return interaction.reply("🏓 Pong! Bot is online.");
    }

    // /profile
    if (interaction.commandName === "profile") {
        const target = interaction.options.getUser("user");

        let user = await User.findOne({ userId: target.id });
        if (!user) user = await User.create({ userId: target.id });

        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`📘 Profile of ${target.username}`)
                    .setColor("Blue")
                    .addFields(
                        { name: "⭐ Average Rating", value: `${user.averageRating.toFixed(2)} ⭐`, inline: true },
                        { name: "📝 Reviews", value: `${user.reviewsCount}`, inline: true },
                        { name: "🔥 XP", value: `${user.xp}`, inline: true },
                        { name: "🏆 Level", value: `${user.level}`, inline: true }
                    )
            ]
        });
    }

    // /review
    if (interaction.commandName === "review") {
        const user = interaction.options.getUser("user");
        const stars = interaction.options.getInteger("stars");
        const category = interaction.options.getString("category");
        const comment = interaction.options.getString("comment") || "No comment provided.";
        const reviewer = interaction.user;

        if (reviewer.id === user.id) {
            return interaction.reply("❌ You cannot review yourself.");
        }

        await Review.create({
            reviewerId: reviewer.id,
            targetId: user.id,
            guildId: interaction.guildId,
            stars,
            category,
            comment
        });

        // Update stats
        let targetUser = await User.findOne({ userId: user.id });
        if (!targetUser) targetUser = await User.create({ userId: user.id });

        const xpGain = stars * 20;
        targetUser.xp += xpGain;

        const all = await Review.find({ targetId: user.id });
        const avg = all.reduce((a, r) => a + r.stars, 0) / all.length;

        targetUser.averageRating = avg;
        targetUser.reviewsCount = all.length;
        targetUser.level = Math.floor(targetUser.xp / 100);

        await targetUser.save();

        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("⭐ New Review Submitted")
                    .setColor("Gold")
                    .setDescription(`**${reviewer}** reviewed **${user}**`)
                    .addFields(
                        { name: "Rating", value: "⭐".repeat(stars) },
                        { name: "Category", value: category },
                        { name: "Comment", value: comment },
                        { name: "New Average", value: `${avg.toFixed(2)} ⭐` },
                        { name: "XP Earned", value: `${xpGain} XP` },
                        { name: "Level", value: `${targetUser.level}` }
                    )
            ]
        });
    }
});

// =============================================
// ======== EXPRESS KEEP-ALIVE FOR KOYEB =======
// =============================================

import express from "express";
const app = express();

app.get("/", (_, res) => res.send("Bot running ✔ 24/7"));

app.listen(process.env.PORT || 3000, () =>
    console.log("🌍 Keepalive Express active (Koyeb ready)")
);

// =============================================
// =============== BOT LOGIN ====================
// =============================================

client.login(process.env.BOT_TOKEN);
