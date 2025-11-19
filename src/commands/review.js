import User from "../models/User.js";
import Review from "../models/Review.js";
import progressBar from "../utils/progressBar.js";
import getRank from "../utils/rank.js";

const xpTable = {
    1: 20,
    2: 40,
    3: 60,
    4: 80,
    5: 100
};

export default async function review(req, res, body) {
    const reviewerId = body.member.user.id;
    const targetId = body.data.options[0].value;
    const stars = body.data.options[1].value;
    const category = body.data.options[2].value;
    const comment =
        body.data.options.length === 4 ? body.data.options[3].value : "No comment.";

    if (targetId === reviewerId) {
        return res.json({
            type: 4,
            data: {
                content: "❌ You cannot review yourself."
            }
        });
    }

    let user = await User.findOne({ userId: targetId });
    if (!user) {
        user = await User.create({
            userId: targetId,
            username: "Unknown",
            avgRating: 0,
            totalReviews: 0,
            xp: 0,
            level: 1
        });
    }

    await Review.create({
        helperId: targetId,
        reviewerId: reviewerId,
        stars,
        category,
        comment
    });

    // Update stats
    user.totalReviews++;
    user.avgRating =
        (user.avgRating * (user.totalReviews - 1) + stars) / user.totalReviews;

    // XP
    const xpEarned = xpTable[stars];
    user.xp += xpEarned;

    while (user.xp >= user.level * 100) {
        user.xp -= user.level * 100;
        user.level++;
    }

    await user.save();

    const rank = getRank(user.level);
    const progress = progressBar(user.xp, user.level);

    return res.json({
        type: 4,
        data: {
            embeds: [
                {
                    title: "⭐ New Review Submitted",
                    description: `**<@${reviewerId}>** rated **<@${targetId}>**\n\n` +
                        `**Rating:**\n${"⭐".repeat(stars)}\n\n` +
                        `**Category:** ${category}\n` +
                        `**Comment:** "${comment}"\n\n` +
                        `**New Average Rating:** ${user.avgRating.toFixed(
                            2
                        )} ⭐ (${user.totalReviews} reviews)\n\n` +
                        `**XP Earned:** ${xpEarned} XP\n` +
                        `**Rank:** ${rank.emoji} ${rank.name}\n` +
                        `**Level:** ${user.level}\n\n` +
                        `**XP Progress:**\n${progress}`,
                    color: 0xf1c40f
                }
            ]
        }
    });
}
