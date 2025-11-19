import User from "../models/User.js";
import { getRank } from "../utils/rank.js";
import { createProgressBar } from "../utils/progressBar.js";

export const data = {
    name: "profile",
    description: "Shows a user's rating profile.",
    options: [
        {
            name: "user",
            type: 6,
            description: "The user you want to see",
            required: true
        }
    ]
};

export async function execute(interaction) {
    const target = interaction.options.getUser("user");

    let user = await User.findOne({ userId: target.id });
    if (!user) user = await User.create({ userId: target.id });

    const { rank, emoji } = getRank(user.level);
    const xpNeeded = user.level * 100;
    const bar = createProgressBar(user.xp, xpNeeded);

    await interaction.reply({
        embeds: [
            {
                title: `${target.username}'s Profile`,
                thumbnail: { url: target.displayAvatarURL() },
                color: 0x00AEEF,
                fields: [
                    { name: "Rank", value: `${emoji} ${rank}` },
                    { name: "Level", value: String(user.level) },
                    { name: "XP", value: `${user.xp} / ${xpNeeded}` },
                    { name: "Progress", value: bar },
                    { name: "Reviews", value: String(user.reviewsCount) },
                    { name: "Average Stars", value: `${user.averageStars.toFixed(2)} ⭐` }
                ]
            }
        ]
    });
}
