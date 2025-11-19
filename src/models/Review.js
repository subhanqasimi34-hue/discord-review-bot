import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema({
    reviewerId: { type: String, required: true },
    targetId: { type: String, required: true },

    guildId: { type: String, required: true },

    stars: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },

    category: {
        type: String,
        enum: ["Ingame", "Support", "Voice", "Chat", "Ticket", "Other"],
        required: true
    },

    comment: {
        type: String,
        default: "No comment provided."
    },

}, {
    timestamps: true
});

export default mongoose.model("Review", ReviewSchema);
