export default async function handler(req, res) {
    try {
        const interaction = req.body;

        // Ping (Discord verlangt Response)
        if (interaction.type === 1) {
            return res.status(200).json({ type: 1 });
        }

        // Handle slash commands
        if (interaction.type === 2) {
            const command = interaction.data.name;

            if (command === "ping") {
                return res.status(200).json({
                    type: 4,
                    data: { content: "🏓 Pong!" }
                });
            }

            return res.status(200).json({
                type: 4,
                data: { content: "Command not implemented yet." }
            });
        }

        res.status(400).send("Unknown interaction type.");
    } catch (err) {
        console.error("Handler error:", err);
        res.status(500).send("Internal error");
    }
}
