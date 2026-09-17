import dotenv from 'dotenv'
dotenv.config()
import bcrypt from "bcrypt";
import { connectToDB } from "../db/db.js";
import { adminModel } from "../models/admin.model.js";

const seedSuperAdmin = async () => {
  try {
    await connectToDB();

    const email = "superadmin@gmail.com";
    const password = "SDC@123456";

    // Don't create duplicate superadmin
    const existingAdmin = await adminModel.findOne({ email });

    if (existingAdmin) {
      console.log("Superadmin already exists");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const admin = await adminModel.create({
      name: "Super Admin",
      email,
      password: hashedPassword,
      role: "superadmin"
    });

    console.log("Superadmin created successfully");
    console.log({
      id: admin._id,
      email: admin.email,
      password,
      role: admin.role
    });

    process.exit(0);

  } catch (error) {
    console.error("Error creating superadmin:", error);
    process.exit(1);
  }
};

seedSuperAdmin();


