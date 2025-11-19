import User from "../models/User.js";
import Review from "../models/Review.js";
import { getRank } from "../utils/rank.js";
import { createProgressBar } from "../utils/progressBar.js";

export const data = {
    name: "review",
    description: "Submit a review for a user.",
    options: [
        {
            name: "user",
            type: 6,
            description: "User to review",
            required: true
        },
        {
            name: "stars",
            type: 4,
            description: "1 to 5 stars",
            required: true
        },
        {
            name: "category",
            type: 3,
            description: "Choose category",
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
};

export async function execute(interaction) {
    const target = interaction.options.getUser("user");
    const stars = interaction.options.getInteger("stars");
    const category = interaction.options.getString("category");
    const comment = interaction.options.getString("comment") || "No comment provided.";

    if (stars < 1 || stars > 5)
        return interaction.reply({ content: "Stars must be between 1 and 5.", ephemeral: true });

    // XP per star
    const xpMap = { 1:20, 2:40, 3:60, 4:80, 5:100 };
    const earnedXP = xpMap[stars];

    // save review
    await Review.create({
        targetId: target.id,
        reviewerId: interaction.user.id,
        stars,
        category,
        comment
    });

    // update profile
    let user = await User.findOne({ userId: target.id });
    if (!user) user = await User.create({ userId: target.id });

    // new average
    const all = await Review.find({ targetId: target.id });
    const avg = all.reduce((a, b) => a + b.stars, 0) / all.length;

    user.reviewsCount = all.length;
    user.averageStars = avg;

    // XP + Level
    user.xp += earnedXP;

    while (user.xp >= user.level * 100) {
        user.xp -= user.level * 100;
        user.level++;
    }

    await user.save();

    const { rank, emoji } = getRank(user.level);
    const xpNeeded = user.level * 100;
    const bar = createProgressBar(user.xp, xpNeeded);

    await interaction.reply({
        embeds: [
            {
                title: "⭐ New Review Submitted",
                color: 0xFFD700,
                description: `**${interaction.user.username} → ${target.username}**\n\n` +
                    `**Rating:**\n${"⭐".repeat(stars)}\n\n` +
                    `**Category:**\n${category}\n\n` +
                    `**Comment:**\n"${comment}"\n\n` +
                    `**New Average Rating:**\n${avg.toFixed(2)} ⭐ (${all.length} total reviews)\n\n` +
                    `**XP Earned:**\n${earnedXP} XP\n\n` +
                    `**Rank:**\n${emoji} ${rank}\n\n` +
                    `**Level:**\n${user.level}\n\n` +
                    `**XP Progress:**\n${bar} ${user.xp} / ${xpNeeded}`
            }
        ]
    });
}
