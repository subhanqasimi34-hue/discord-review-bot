import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    userId: String,
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    reviewsCount: { type: Number, default: 0 },
    averageStars: { type: Number, default: 0 },
});

export default mongoose.model("User", userSchema);
