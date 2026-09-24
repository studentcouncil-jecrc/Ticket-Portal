import bcrypt from "bcrypt";
import  jwt from "jsonwebtoken";
import {adminModel} from "../models/admin.model.js";
import mongoose from "mongoose";
import Student from "../models/student.model.js";



export const adminLogin = async (req, res) => {
try {
    const { email, password } = req.body;

const admin = await adminModel.findOne({
    email: email.trim().toLowerCase()
}).select("+password");

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
    });

    return res.status(201).json({
      success: true,
      msg: "Admin created successfully",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
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


export const createStudent = async (req, res) => {
  try {
    const {
      name,
      studentId,
      email,
      branch,
      Year,
    } = req.body;

    const student = await Student.create({
      name,
      studentId,
      email,
      branch,
      Year,
    });

    return res.status(201).json({
      success: true,
      msg: "Student created successfully",
      student: {
        id: student._id,
        name: student.name,
        studentId: student.studentId,
        email: student.email,
        branch: student.branch,
        Year: student.Year,
        isPaid: student.isPaid,
        passSent: student.passSent,
      }
    });

  } catch (error) {
    console.error("Create student error:", error);

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];

      return res.status(409).json({
        success: false,
        msg: `${field} already exists`
      });
    }

    return res.status(500).json({
      success: false,
      msg: "Internal server error"
    });
  }
};


export const getStudents = async (req, res) => {
  try {
    const { role } = req.user;

    // Only allowed roles can view students
    if (!["superadmin", "admin"].includes(role)) {
      return res.status(403).json({
        msg: "Not allowed to view students"
      });
    }

    // Get stats for ALL students
    const [stats] = await Student.aggregate([
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          paidCount: {
            $sum: {
              $cond: ["$isPaid", 1, 0]
            }
          }
        }
      }
    ]);

    // Get ALL students
    const students = await Student.find({})
      .select("name email phone branch Year isPaid")
      .sort({ Year: 1, name: 1 })
      .lean();

    res.status(200).json({
      success: true,
      count: stats?.count ?? students.length,
      paidCount: stats?.paidCount ?? 0,
      data: students
    });

  } catch (err) {
    console.error("Fetch students error:", err);

    res.status(500).json({
      msg: "Error fetching students"
    });
  }
};


export const searchStudents = async (req, res) => {
  try {
    const { role } = req.user;
    const { query } = req.query;

    // Check permission
    if (!["superadmin", "admin"].includes(role)) {
      return res.status(403).json({
        success: false,
        msg: "Not allowed to search students"
      });
    }

    // Check search query
    if (!query || !query.trim()) {
      return res.status(400).json({
        success: false,
        msg: "Search query is required"
      });
    }

    // Search ALL students by email
    const students = await Student.find({
      email: {
        $regex: query.trim(),
        $options: "i"
      }
    })
      .select("name studentId email phone branch Year isPaid")
      .limit(10)
      .lean();

    return res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });

  } catch (error) {
    console.error("Search students error:", error);

    return res.status(500).json({
      success: false,
      msg: "Search failed"
    });
  }
};


export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        msg: "Student ID is required"
      });
    }

    const student = await Student.findById(id);

    if (!student) {
      return res.status(404).json({
        success: false,
        msg: "Student not found"
      });
    }


    await Student.deleteOne({
      _id: id
    });

    return res.status(200).json({
      success: true,
      msg: "Student deleted successfully"
    });

  } catch (err) {
    console.error("Delete student error:", err);

    return res.status(500).json({
      success: false,
      msg: "Failed to delete student"
    });
  }
};