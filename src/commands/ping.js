export default function ping(req, res, body) {
    return res.json({
        type: 4,
        data: {
            content: "🏓 Pong!"
        }
    });
}
