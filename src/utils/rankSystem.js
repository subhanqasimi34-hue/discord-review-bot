function getRank(level) {
    if (level >= 50) return "🏆 Champion";
    if (level >= 35) return "💎 Diamond";
    if (level >= 25) return "🟦 Platinum";
    if (level >= 15) return "🥇 Gold";
    if (level >= 8) return "🥈 Silver";
    return "🥉 Bronze";
}

module.exports = { getRank };
