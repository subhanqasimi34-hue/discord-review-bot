export function createProgressBar(current, max, size = 20) {
    const filled = Math.round((current / max) * size);
    return "█".repeat(filled) + "░".repeat(size - filled);
}
