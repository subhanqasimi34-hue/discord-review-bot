import "dotenv/config";
import express from "express";
import { verifyKeyMiddleware } from "discord-interactions";
import handler from "./handler.js";
import connectDB from "./src/db.js";

connectDB();

const app = express();

app.get("/", (_, res) => {
    res.send("✔ Bot is running and webhook online");
});

app.post(
    "/interactions",
    express.raw({ type: "application/json" }),
    verifyKeyMiddleware(process.env.PUBLIC_KEY),
    handler
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🌍 Server running on port ${PORT}`));
