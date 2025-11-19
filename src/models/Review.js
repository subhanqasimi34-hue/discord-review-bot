import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    targetId: String,
    reviewerId: String,
    stars: Number,
    category: String,
    comment: String,
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Review", reviewSchema);
