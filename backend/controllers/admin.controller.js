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


export const createStudent = async (req, res) => {
  try {
    const {
      name,
      studentId,
      email,
      branch,
      Year,
      phone,
      isPaid
    } = req.body;

    const student = await Student.create({
      name,
      studentId,
      email,
      branch,
      Year,
      phone: phone || null,
      isPaid: isPaid ?? false
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
        phone: student.phone,
        isPaid: student.isPaid,
        token: student.token,
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
    const { role, branch, year } = req.user;
    let query = {};

    if (role === "superadmin" || role === "admin") {
      query = {};
    } else if (role === "hod") {
      // HODs can see only 2nd, 3rd, 4th year students in their branch
      query = { branch, Year: { $ne: 1 } };
    } else if (role === "dean") {
      query = { Year: Number(year ?? 1) };
    } else {
      return res.status(403).json({ msg: "Not allowed to view students" });
    }

    // Get counts without loading full documents into memory
    const [stats] = await Student.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          paidCount: { $sum: { $cond: ["$isPaid", 1, 0] } },
        }
      }
    ]);

    const students = await Student.find(query)
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
    res.status(500).json({ msg: "Error fetching students" });
  }

}


export const searchStudents = async (req, res) => {             //when an student is searched by name this will return matched values.
  try {
    const { role, branch, year } = req.user;
    const { query } = req.query;

    if (!query || !query.trim()) {
      return res.status(400).json({
        success: false,
        msg: "Search query is required"
      });
    }

    let filter = {};

    if (role === "superadmin" || role === "admin") {
      filter = {};
    }

    else if (role === "hod") {
      filter = {
        branch,
        Year: { $in: [2, 3, 4] }
      };
    }

    else if (role === "dean") {
      filter = {
        Year: Number(year)
      };
    }

    else {
      return res.status(403).json({
        success: false,
        msg: "Not allowed to search students"
      });
    }

    filter.name = {
      $regex: query.trim(),
      $options: "i"
    };

    const students = await Student.find(filter)
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