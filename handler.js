import User from "./models/User.js";
import Review from "./models/Review.js";
import { rankFromLevel } from "./utils/rank.js";
import { progressBar } from "./utils/progressBar.js";

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
        await Review.crea
