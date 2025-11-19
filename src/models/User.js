import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true }, // Discord User ID
    username: { type: String, default: "Unknown" },
    avatar: { type: String, default: null },

    reviewsCount: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },

    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },

    lastReviewAt: { type: Date, default: null }, // optional, für cooldown
}, {
    timestamps: true
});

export default mongoose.model("User", UserSchema);
