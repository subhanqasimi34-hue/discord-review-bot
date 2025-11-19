export default function handler(req, res) {
    console.log("✔️ Interaction received:", req.body);

    // Discord PING
    if (req.body?.type === 1) {
        console.log("✔️ Responding to PING");
        return res.json({ type: 1 });
    }

    // Für alle Commands – test response
    return res.json({
        type: 4,
        data: {
            content: "✔️ Handler reached! Your bot is online."
        }
    });
}
