import User from "../models/User.js";
import progressBar from "../utils/progressBar.js";
import getRank from "../utils/rank.js";

export default async function profile(req, res, body) {
    const userId = body.data.options[0].value;

    let user = await User.findOne({ userId });
    if (!user) {
        return res.json({
            type: 4,
            data: { content: "This user has no profile yet." }
        });
    }

    const progress = progressBar(user.xp, user.level);
    const rank = getRank(user.level);

    return res.json({
        type: 4,
        data: {
            embeds: [
                {
                    title: `${user.username}'s Helper Profile`,
                    description: `⭐ **Average Rating:** ${user.avgRating.toFixed(
                        2
                    )}\n📊 **Total Reviews:** ${user.totalReviews}\n\n⚡ **XP:** ${
                        user.xp
                    }\n🏆 **Level:** ${user.level}\n🎖 **Rank:** ${rank.emoji} ${rank.name}\n\n📈 **XP Progress:**\n${progress}`,
                    color: 0xffd04a
                }
            ]
        }
    });
}
