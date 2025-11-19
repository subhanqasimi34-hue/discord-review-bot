const mongoose = require("mongoose");

const HelperSchema = new mongoose.Schema({
    userId: String,
    guildId: String,
    reviews: Number,
    totalStars: Number,
    averageStars: Number,
    xp: Number,
    level: Number,
    rank: String
});

module.exports = mongoose.model("Helper", HelperSchema);
