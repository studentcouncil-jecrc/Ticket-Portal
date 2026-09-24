import mongoose from "mongoose"

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select:false },

    role: {
      type: String,
      enum: ["superadmin", "admin",],
      required: true
    },
  },
  { timestamps: true }
);

export const adminModel =  mongoose.model('Admin', adminSchema);