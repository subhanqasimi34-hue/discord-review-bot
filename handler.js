import User from "./models/User.js";
import Review from "./models/Review.js";
import { rankFromLevel } from "./utils/rank.js";
import { progressBar } from "./utils/progressBar.js";

export default async function handler(req, res) {
    try {
        const interaction = JSON.parse(req.body.toString());
        const { type, data } = interaction;

        // ----------------------------------------------------
        // 1) PING — Discord Verification
        // ----------------------------------------------------
        if (type === 1) {
            return res.json({ type: 1 });
        }

        // ----------------------------------------------------
        // /ping
        // ----------------------------------------------------
        if (data?.name === "ping") {
            return res.json({
                type: 4,
                data: {
                    content: "🏓 Pong! Webhook is alive."
                }
            });
        }

        // ----------------------------------------------------
        // /profile
        // ----------------------------------------------------
        if (data?.name === "profile") {
            const target = data.options[0].value;

            let user = await User.findOne({ userId: target });
            if (!user) user = await User.create({ userId: target });

            const rank = rankFromLevel(user.level);
            const bar = progressBar(user.xp % 100, 100);

            return res.json({
                type: 4,
                data: {
                    embeds: [
                        {
                            title: `📘 Profile of <@${target}>`,
                            color: 0x00AEEF,
                            fields: [
                                { name: "⭐ Average Rating", value: `${user.averageRating.toFixed(2)} ⭐`, inline: true },
                                { name: "📝 Reviews", value: `${user.reviewsCount}`, inline: true },
                                { name: "🔥 XP", value: `${user.xp}`, inline: true },
                                { name: "🏆 Level", value: `${user.level}`, inline: true },
                                { name: "🎖 Rank", value: `${rank.emoji} ${rank.name}`, inline: true },
                                { name: "📊 XP Progress", value: `${bar}\n${user.xp % 100}/100 XP`, inline: false }
                            ]
                        }
                    ]
                }
            });
        }

        // ----------------------------------------------------
        // /review
        // ----------------------------------------------------
        if (data?.name === "review") {
            const [userOpt, starsOpt, catOpt, commentOpt] = data.options;

            const reviewerId = interaction.member.user.id;
            const targetId = userOpt.value;

            if (reviewerId === targetId) {
                return res.json({
                    type: 4,
                    data: { content: "❌ You cannot review yourself." }
                });
            }

            const stars = starsOpt.value;
            const category = catOpt.value;
            const comment = commentOpt?.value || "No comment provided.";

            // Save review
            await Review.create({
                reviewerId,
                targetId,
                guildId: interaction.guild_id,
                stars,
                category,
                comment
            });

            // Update target user
            let user = await User.findOne({ userId: targetId });
            if (!user) user = await User.create({ userId: targetId });

            // XP: 1⭐ = 20 XP
            const xpGain = stars * 20;
            user.xp += xpGain;

            // Calculate new average
            const allReviews = await Review.find({ targetId });
            const average =
                allReviews.reduce((sum, r) => sum + r.stars, 0) /
                allReviews.length;

            user.averageRating = average;
            user.reviewsCount = allReviews.length;
            user.level = Math.floor(user.xp / 100);

            await user.save();

            const rank = rankFromLevel(user.level);

            return res.json({
                type: 4,
                data: {
                    embeds: [
                        {
                            title: "⭐ New Review Submitted",
                            color: 0xFFD700,
                            description: `**<@${reviewerId}>** reviewed **<@${targetId}>**`,
                            fields: [
                                { name: "Rating", value: "⭐".repeat(stars), inline: true },
                                { name: "Category", value: category, inline: true },
                                { name: "Comment", value: comment, inline: false },
                                { name: "New Average", value: `${average.toFixed(2)} ⭐`, inline: true },
                                { name: "XP Earned", value: `${xpGain} XP`, inline: true },
                                { name: "Rank", value: `${rank.emoji} ${rank.name}`, inline: true },
                                { name: "Level", value: `${user.level}`, inline: true }
                            ]
                        }
                    ]
                }
            });
        }

        // Unknown command
        return res.json({
            type: 4,
            data: { content: "❌ Unknown command." }
        });

    } catch (err) {
        console.error("Handler Error:", err);
        return res.json({
            type: 4,
            data: { content: "❌ Internal server error." }
        });
    }
}
