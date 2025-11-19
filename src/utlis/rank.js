export function getRank(level) {
    if (level < 8) return { rank: "Bronze", emoji: "🟤" };
    if (level < 20) return { rank: "Silver", emoji: "⚪" };
    if (level < 40) return { rank: "Gold", emoji: "🟡" };
    if (level < 80) return { rank: "Diamond", emoji: "🔷" };
    return { rank: "Master", emoji: "🔥" };
}
