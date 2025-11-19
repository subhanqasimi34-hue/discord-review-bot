import mongoose from "mongoose";

export default async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("🍃 MongoDB connected");
    } catch (err) {
        console.error("❌ MongoDB error:", err);
        process.exit(1);
    }
}
