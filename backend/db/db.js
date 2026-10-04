import mongoose from "mongoose";

export const connectToDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (err) {
    console.error(`MongoDB connection failed: ${err.message}`);
    throw err;
  }
};
