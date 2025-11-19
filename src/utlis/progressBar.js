// src/utils/progressBar.js

export default function progressBar(xp, level) {
    const needed = level * 100;
    const percent = xp / needed;

    const totalBars = 20; 
    const filledBars = Math.round(percent * totalBars);
    const emptyBars = totalBars - filledBars;

    return (
        "█".repeat(filledBars) +
        "░".repeat(emptyBars) +
        `  ${xp} / ${needed} XP`
    );
}
