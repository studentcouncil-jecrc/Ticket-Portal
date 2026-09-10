import bcrypt from "bcrypt";
import  jwt from "jsonwebtoken";
import {adminModel} from "../models/admin.model.js";
import mongoose from "mongoose";



export const adminLogin = async (req, res) => {
try {
    const { email, password } = req.body;

    const admin = await adminModel.findOne({
    email: email.trim().toLowerCase()
    });

    if (!admin) {
    return res.status(401).json({
        success: false,
        msg: "Invalid credentials"
    });
    }

    const isMatch = await bcrypt.compare(
    password,
    admin.password
    );

    if (!isMatch) {
    return res.status(401).json({
        success: false,
        msg: "Invalid credentials"
    });
    }

    const token = jwt.sign(
    {
        id: admin._id,
        role: admin.role,
        branch: admin.branch ?? null,
        year: admin.year ?? null
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
    );

    return res.status(200).json({
    success: true,
    token
    });

} catch (error) {
    console.error("Teacher login error:", error);

    return res.status(500).json({
    success: false,
    msg: "Internal server error"
    });
}
};


export const createAdmin = async (req, res) => {
try {
    const {
    name,
    email,
    password,
    role,
    branch,
    year
    } = req.body;

    const normalizedEmail = email.trim().toLowerCase();


    const existingAdmin = await adminModel.findOne({
    email: normalizedEmail
    });

    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        msg: "Admin with this email already exists"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create admin
    const admin = await adminModel.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role,
      branch: branch || undefined,
      year: year || undefined
    });

    return res.status(201).json({
      success: true,
      msg: "Admin created successfully",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        branch: admin.branch ?? null,
        year: admin.year ?? null
      }
    });

  } catch (error) {
    console.error("Create admin error:", error);

    return res.status(500).json({
      success: false,
      msg: "Internal server error"
    });
  }
};


export const getAdmins = async (req, res) => {
  try {
    const admins = await adminModel
      .find({})
      .select("-password");

    return res.status(200).json({
      success: true,
      admins
    });

  } catch (error) {
    console.error("Get admins error:", error);

    return res.status(500).json({
      success: false,
      msg: "Internal server error"
    });
  }
};




export const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        msg: "Invalid admin ID"
      });
    }

    // Find the admin first
    const admin = await adminModel.findById(id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        msg: "Admin not found"
      });
    }

    // Superadmin cannot delete another superadmin
    if (admin.role === "superadmin") {
      return res.status(403).json({
        success: false,
        msg: "Superadmin cannot delete another superadmin"
      });
    }

    await adminModel.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      msg: "Admin deleted successfully"
    });

  } catch (error) {
    console.error("Delete admin error:", error);

    return res.status(500).json({
      success: false,
      msg: "Internal server error"
    });
  }
};