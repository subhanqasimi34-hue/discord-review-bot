const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder
} = require("discord.js");

const Helper = require("../database/models/Helper");
const Review = require("../database/models/Review");
const { getXPBar } = require("../utils/xpSystem");
const { getRank } = require("../utils/rankSystem");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("review")
        .setDescription("Leave a review for a helper.")
        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("Select a helper to review")
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option
                .setName("stars")
                .setDescription("Rating (1 to 5)")
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(5)
        )
        .addStringOption(option =>
            option
                .setName("comment")
                .setDescription("Optional comment")
                .setRequired(false)
        ),

    async execute(interaction) {
        const target = interaction.options.getUser("user");
        const stars = interaction.options.getInteger("stars");
        const comment = interaction.options.getString("comment") || "No comment provided.";
        const guildId = interaction.guild.id;

        if (target.id === interaction.user.id) {
            return interaction.reply({
                content: "You cannot review yourself.",
                flags: 64
            });
        }

        // CATEGORY SELECT
        const menu = new StringSelectMenuBuilder()
            .setCustomId("review_category")
            .setPlaceholder("Choose a help category")
            .addOptions([
                { label: "Ingame", value: "Ingame" },
                { label: "Support", value: "Support" },
                { label: "Chat", value: "Chat" },
                { label: "Ticket", value: "Ticket" }
            ]);

        const row = new ActionRowBuilder().addComponents(menu);

        // 🔥 WICHTIG: Nur EINE Antwort
        await interaction.reply({
            content: "Select the category for this review:",
            components: [row],
            flags: 64
        });

        // WAIT FOR SELECT
        const collector = interaction.channel.createMessageComponentCollector({
            filter: i => i.customId === "review_category" && i.user.id === interaction.user.id,
            time: 30000,
            max: 1
        });

        collector.on("collect", async i => {
            const category = i.values[0];

            // LOAD OR CREATE HELPER
            let helper = await Helper.findOne({ userId: target.id, guildId });

            if (!helper) {
                helper = new Helper({
                    userId: target.id,
                    guildId,
                    reviews: 0,
                    totalStars: 0,
                    averageStars: 0,
                    xp: 0,
                    level: 1
                });
            }

            // XP + LEVEL
            const xpGain = stars * 20;
            helper.reviews++;
            helper.totalStars += stars;
            helper.averageStars = helper.totalStars / helper.reviews;
            helper.xp += xpGain;

            const xpNeeded = helper.level * 100;
            if (helper.xp >= xpNeeded) {
                helper.level++;
            }

            helper.rank = getRank(helper.level);
            await helper.save();

            // SAVE REVIEW
            await new Review({
                helperId: target.id,
                reviewerId: interaction.user.id,
                guildId,
                stars,
                comment,
                category
            }).save();

            const xpBar = getXPBar(helper.xp, helper.level * 100);

            // FINAL EMBED
            const embed = new EmbedBuilder()
                .setColor("#ffcc00")
                .setTitle("⭐ New Review Submitted")
                .setThumbnail(target.displayAvatarURL({ size: 256 }))
                .addFields(
                    { name: "Helper", value: `${target}`, inline: true },
                    { name: "Rating", value: "⭐".repeat(stars), inline: true },
                    { name: "Category", value: category, inline: true },
                    { name: "Comment", value: comment },
                    { name: "New Average", value: `${helper.averageStars.toFixed(2)} ⭐`, inline: true },
                    { name: "XP Gained", value: `${xpGain} XP`, inline: true },
                    { name: "Level", value: `${helper.level}`, inline: true },
                    { name: "Rank", value: `${helper.rank}` },
                    { name: "XP", value: `${xpBar}\n${helper.xp}/${helper.level * 100} XP` }
                )
                .setFooter({
                    text: `Reviewer: ${interaction.user.username}`,
                    iconURL: interaction.user.displayAvatarURL()
                })
                .setTimestamp();

            // 🔥 UPDATE (keine zweite Interaction-Reply)
            await i.update({
                content: "",
                embeds: [embed],
                components: []
            });
        });

        // TIMEOUT
        collector.on("end", c => {
            if (c.size === 0) {
                interaction.editReply({
                    content: "Review cancelled. No category selected.",
                    components: []
                });
            }
        });
    }
};
