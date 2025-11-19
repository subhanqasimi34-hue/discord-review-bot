import "./utils/database.js"; // lädt DB + Migrationen automatisch
import express from "express";
import { verifyKeyMiddleware } from "discord-interactions";
import handler from "./handler.js";

const app = express();
app.use(express.json());

// Alive Check für Koyeb / UptimeRobot / Upptime
app.get("/", (req, res) => {
    res.status(200).json({
        status: "online",
        service: "discord-review-bot",
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// Discord Webhook Endpoint
app.post(
    "/interactions",
    verifyKeyMiddleware(process.env.PUBLIC_KEY),
    handler
);

// Port für Koyeb
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Review Bot Webhook live on PORT ${PORT}`);
});
