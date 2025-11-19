const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Shows the bot and API latency."),

    async execute(interaction) {
        const sent = await interaction.reply({
            content: "Pinging...",
            fetchReply: true
        });

        const botPing = sent.createdTimestamp - interaction.createdTimestamp;
        const apiPing = interaction.client.ws.ping;

        const embed = new EmbedBuilder()
            .setColor("#57F287")
            .setTitle("🏓 Pong!")
            .addFields(
                {
                    name: "🤖 Bot Latency",
                    value: `${botPing}ms`,
                    inline: true
                },
                {
                    name: "📡 API Latency",
                    value: `${apiPing}ms`,
                    inline: true
                },
                {
                    name: "⚙️ Status",
                    value: apiPing < 150
                        ? "🟢 Stable"
                        : apiPing < 300
                        ? "🟡 Moderate"
                        : "🔴 Slow",
                    inline: true
                }
            )
            .setTimestamp();

        await interaction.editReply({ content: "", embeds: [embed] });
    }
};
