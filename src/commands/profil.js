const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const Helper = require("../database/models/Helper");
const { getXPBar } = require("../utils/xpSystem");
const { getRank } = require("../utils/rankSystem");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("profil")
        .setDescription("Shows your helper profile.")
        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("View profile of another user")
                .setRequired(false)
        ),

    async execute(interaction) {
        const user = interaction.options.getUser("user") || interaction.user;
        const guildId = interaction.guild.id;

        // Helper-Daten laden
        let helper = await Helper.findOne({ userId: user.id, guildId });

        // Wenn User noch nie bewertet wurde → Basisprofil erstellen
        if (!helper) {
            helper = new Helper({
                userId: user.id,
                guildId,
                reviews: 0,
                totalStars: 0,
                averageStars: 0,
                xp: 0,
                level: 1,
                rank: "🥉 Bronze"
            });
            await helper.save();
        }

        // XP Berechnung
        const xpNeeded = helper.level * 100;
        const xpBar = getXPBar(helper.xp, xpNeeded);

        // Embed bauen
        const embed = new EmbedBuilder()
            .setColor("#ffcc00")
            .setTitle(`${user.username}'s Helper Profile`)
            .setThumbnail(user.displayAvatarURL({ size: 256 }))
            .addFields(
                { name: "⭐ Average Rating", value: `${helper.averageStars.toFixed(2)} ⭐`, inline: true },
                { name: "📝 Total Reviews", value: `${helper.reviews}`, inline: true },
                { name: "🏆 Rank", value: `${getRank(helper.level)}`, inline: true },
                { name: "🔢 Level", value: `${helper.level}`, inline: true },
                { name: "⚡ XP", value: `${helper.xp}/${xpNeeded}`, inline: true },
                { name: "📊 XP Progress", value: xpBar }
            )
            .setFooter({
                text: `Requested by ${interaction.user.username}`,
                iconURL: interaction.user.displayAvatarURL()
            })
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    }
};
