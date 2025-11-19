import User from "./src/models/User.js";
import Review from "./src/models/Review.js";
import { rankFromLevel } from "./src/utils/rank.js";
import { progressBar } from "./src/utils/progressBar.js";

export default async function handler(req, res) {
    const interaction = JSON.parse(req.body.toString());
    const { type, data } = interaction;

    // PING HANDSHAKE
    if (type === 1) {
        return res.json({ type: 1 });
    }

    if (data?.name === "ping") {
        return res.json({
            type: 4,
            data: {
                content: "🏓 Pong! Webhook online."
            }
        });
    }

    // -------------------- PROFILE --------------------
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

    // -------------------- REVIEW --------------------
    if (data?.name === "review") {
        const [userOption, starsOption, categoryOption, commentOption] = data.options;

        const reviewerId = interaction.member.user.id;
        const targetId = userOption.value;

        if (reviewerId === targetId) {
            return res.json({
                type: 4,
                data: { content: "❌ You cannot review yourself." }
            });
        }

        const stars = starsOption.value;
        const category = categoryOption.value;
        const comment = commentOption?.value || "No comment provided.";

        // Save review
        await Review.create({
            reviewerId,
            targetId,
            guildId: interaction.guild_id,
            stars,
            category,
            comment
        });

        // Update user stats
        let user = await User.findOne({ userId: targetId });
        if (!user) user = await User.create({ userId: targetId });

        // XP system
        const xpGain = stars * 20;
        user.xp += xpGain;

        // Update average rating
        const allReviews = await Review.find({ targetId });
        const avg =
            allReviews.reduce((a, r) => a + r.stars, 0) / allReviews.length;

        user.averageRating = avg;
        user.reviewsCount = allReviews.length;

        // Level up (1 level = each 100 XP)
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
                            { name: "New Average", value: `${avg.toFixed(2)} ⭐`, inline: true },
                            { name: "XP Earned", value: `${xpGain} XP`, inline: true },
                            { name: "Rank", value: `${rank.emoji} ${rank.name}`, inline: true },
                            { name: "Level", value: `${user.level}`, inline: true }
                        ]
                    }
                ]
            }
        });
    }

    return res.json({
        type: 4,
        data: { content: "❌ Unknown command." }
    });
}
