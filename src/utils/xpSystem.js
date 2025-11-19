function getXPBar(xp, needed, size = 20) {
    const filled = Math.round((xp / needed) * size);
    const empty = size - filled;

    return "▰".repeat(filled) + "▱".repeat(empty);
}

module.exports = { getXPBar };
