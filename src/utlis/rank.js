// src/utils/rank.js

export default function getRank(level) {
    if (level < 8) {
        return { name: "Bronze", emoji: "🟤" };
    }
    if (level < 20) {
        return { name: "Silver", emoji: "⚪" };
    }
    if (level < 40) {
        return { name: "Gold", emoji: "🟡" };
    }
    if (level < 80) {
        return { name: "Diamond", emoji: "🔷" };
    }

    return { name: "Master", emoji: "🔥" };
}
