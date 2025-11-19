import fetch from "node-fetch";

const URL = controversial-mara-discordbot-review-7b1f8819.koyeb.app/; // Dein Koyeb / URL

async function ping() {
    try {
        const res = await fetch(URL);
        console.log("KeepAlive ping:", res.status);
    } catch (err) {
        console.log("KeepAlive error:", err.message);
    }
}

ping();
