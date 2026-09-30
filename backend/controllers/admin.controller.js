import bcrypt from "bcrypt";
import  jwt from "jsonwebtoken";
import {adminModel} from "../models/admin.model.js";
import mongoose from "mongoose";
import Student from "../models/student.model.js";
import AppAdmin from "../models/app.admin.model.js";


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
        email:admin.email,
        name:admin.name
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
    );

    return res.status(200).json({
    success: true,
    token,
    admin
    });

} catch (error) {
    console.error("Teacher login error:", error);

    return res.status(500).json({
    error:error,
    success: false,
    msg: "Internal server error"
    });
}
};


export const adminProfile = async (req, res) => {
res.status(200).json(req.user);
}


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
    const { id } = req.body;

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

      count: {
        $sum: 1
      },

      paidCount: {
        $sum: {
          $cond: ["$isPaid", 1, 0]
        }
      },

      scannedCount: {
        $sum: {
          $cond: ["$isScanned", 1, 0]
        }
      }
    }
  }
]);

    // Get ALL students
    const students = await Student.find({})
      .select("name email phone branch Year isPaid studentId ticketStatus")
      .sort({ Year: 1, name: 1 })
      .lean();

    res.status(200).json({
      success: true,
      count: stats?.count ?? students.length,
      paidCount: stats?.paidCount ?? 0,
      scannedCount:stats?.scannedCount??0,
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


export const createAppAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingAdmin = await AppAdmin.findOne({ email });

    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        msg: "App admin with this email already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const appAdmin = await AppAdmin.create({
      name,
      email,
      password: hashedPassword
    });

    return res.status(201).json({
      success: true,
      msg: "App admin created successfully",
      appAdmin: {
        id: appAdmin._id,
        name: appAdmin.name,
        email: appAdmin.email
      }
    });

  } catch (error) {
    console.error("Create app admin error:", error);

    return res.status(500).json({
      success: false,
      msg: "Failed to create app admin"
    });
  }
};


export const getAppAdmins = async (req, res) => {
  try {
    const appAdmins = await AppAdmin.find()
      .select("-password")
      .sort({ createdAt: -1 });


    return res.status(200).json({
      success: true,
      data: appAdmins,
    });

  } catch (error) {
    console.error("Get app admins error:", error);

    return res.status(500).json({
      success: false,
      msg: "Failed to fetch app admins"
    });
  }
};


export const deleteAppAdmin = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        msg: "App admin ID is required"
      });
    }

    const appAdmin = await AppAdmin.findById(id);

    if (!appAdmin) {
      return res.status(404).json({
        success: false,
        msg: "App admin not found"
      });
    }

    await AppAdmin.deleteOne({ _id: id });

    return res.status(200).json({
      success: true,
      msg: "App admin deleted successfully"
    });

  } catch (error) {
    console.error("Delete app admin error:", error);

    return res.status(500).json({
      success: false,
      msg: "Failed to delete app admin"
    });
  }
};



export const getStats = async (req, res) => {
  try {
    const [studentStats] = await Student.aggregate([
      {
        $group: {
          _id: null,

          totalStudents: {
            $sum: 1
          },

          passesSent: {
            $sum: {
              $cond: [
                { $eq: ["$isPaid", true] },
                1,
                0
              ]
            }
          },

          unpaid: {
            $sum: {
              $cond: [
                { $eq: ["$isPaid", false] },
                1,
                0
              ]
            }
          },

          totalTicketsScanned: {
            $sum: {
              $cond: [
                { $eq: ["$isScanned", true] },
                1,
                0
              ]
            }
          },

          yetToEnter: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$isPaid", true] },
                    { $eq: ["$isScanned", false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const totalAppAdmins = await AppAdmin.countDocuments();

    const activeScanners = await AppAdmin.countDocuments({
      isLoggedIn: true
    });

    const totalStudents = studentStats?.totalStudents ?? 0;
    const passesSent = studentStats?.passesSent ?? 0;
    const unpaid = studentStats?.unpaid ?? 0;
    const totalTicketsScanned =
      studentStats?.totalTicketsScanned ?? 0;
    const yetToEnter = studentStats?.yetToEnter ?? 0;

    const entryRate =
      totalStudents > 0
        ? Number(
            ((totalTicketsScanned / totalStudents) * 100).toFixed(2)
          )
        : 0;

    return res.status(200).json({
      success: true,
      stats: {
        totalStudents,
        passesSent,
        unpaid,
        totalTicketsScanned,
        yetToEnter,
        entryRate,
        activeScanners,
        totalScanners: totalAppAdmins
      }
    });

  } catch (error) {
    console.error("Get stats error:", error);

    return res.status(500).json({
      success: false,
      msg: "Failed to fetch statistics"
    });
  }
};