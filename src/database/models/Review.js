const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
    helperId: String,
    reviewerId: String,
    guildId: String,
    stars: Number,
    comment: String,
    category: String,
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Review", ReviewSchema);
