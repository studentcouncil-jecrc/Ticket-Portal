import dotenv from 'dotenv'
dotenv.config()
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectToDB } from "../db/db.js";
import { adminModel } from "../models/admin.model.js";

const seedSuperAdmin = async () => {
  try {
    const name = process.env.SUPERADMIN_NAME;
    const email = process.env.SUPERADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.SUPERADMIN_PASSWORD;

    if (!name || !email || !password) {
      throw new Error(
        'SUPERADMIN_NAME, SUPERADMIN_EMAIL, and SUPERADMIN_PASSWORD are required.'
      );
    }

    await connectToDB();

    // Don't create duplicate superadmin
    const existingAdmin = await adminModel.findOne({ email });

    if (existingAdmin) {
      console.log("Superadmin already exists");
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const admin = await adminModel.create({
      name,
      email,
      password: hashedPassword,
      role: "superadmin"
    });

    console.log("Superadmin created successfully");
    console.log({
      id: admin._id,
      email: admin.email,
      role: admin.role
    });

  } catch (error) {
    console.error("Error creating superadmin:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedSuperAdmin();
