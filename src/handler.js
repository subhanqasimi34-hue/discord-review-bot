export default function handler(req, res) {
    console.log("✔️ Interaction received:", req.body);

    if (req.body?.type === 1) {
        return res.json({ type: 1 });
    }

    return res.json({
        type: 4,
        data: { content: "Pong! Bot + Handler läuft." }
    });
}
