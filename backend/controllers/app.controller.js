import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import AppAdmin from "../models/app.admin.model.js";
import BlacklistedToken from "../models/blacklistToken.model.js";
import Student from "../models/student.model.js";

const isValidStudentObjectId = (mId) =>
  typeof mId === "string" && /^[a-fA-F0-9]{24}$/.test(mId);

export const appAdminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const appAdmin = await AppAdmin.findOne({ email });

    if (!appAdmin) {
      return res.status(401).json({
        success: false,
        msg: "Invalid email or password"
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      appAdmin.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        msg: "Invalid email or password"
      });
    }

    if (appAdmin.isLoggedIn) {
      return res.status(409).json({
        success: false,
        msg: "This account is already logged in"
      });
    }

    appAdmin.isLoggedIn = true;
    await appAdmin.save();

    const token = jwt.sign(
      {
        id: appAdmin._id,
        email: appAdmin.email
      },
      process.env.APP_ADMIN_JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    return res.status(200).json({
      success: true,
      msg: "Login successful",
      token,
      appAdmin: {
        id: appAdmin._id,
        name: appAdmin.name,
        email: appAdmin.email
      }
    });

  } catch (error) {
    console.error("App admin login error:", error);

    return res.status(500).json({
      success: false,
      msg: "Login failed"
    });
  }
};



export const appAdminLogout = async (req, res) => {
  try {
    const token = req.appToken;

    const decoded = jwt.decode(token);

    if (!decoded?.exp) {
      return res.status(400).json({
        success: false,
        msg: "Invalid token"
      });
    }

    const expiresAt = new Date(decoded.exp * 1000);

    await BlacklistedToken.create({
      token,
      expiresAt
    });

    req.appAdmin.isLoggedIn = false;
    await req.appAdmin.save();

    return res.status(200).json({
      success: true,
      msg: "Logout successful"
    });

  } catch (error) {
    console.error("App admin logout error:", error);

    return res.status(500).json({
      success: false,
      msg: "Logout failed"
    });
  }
};


export const scanTicket = async (req, res) => {
  try {
    const { mId } = req.body;

    if (!isValidStudentObjectId(mId)) {
      return res.status(400).json({
        success: false,
        msg: "Invalid QR code"
      });
    }

    const student = await Student.findById(mId).select(
      "name email branch Year isPaid isScanned"
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        msg: "Student not found"
      });
    }

    // Already scanned
    if (student.isScanned) {
      return res.status(200).json({
        success: true,
        canEnter: false,
        reason: "ALREADY_SCANNED",
        msg: "Entry already taken",
        student: {
          name: student.name,
          email: student.email,
          branch: student.branch,
          year: student.Year
        }
      });
    }

    // Fee not paid / revoked
    if (!student.isPaid) {
      return res.status(200).json({
        success: true,
        canEnter: false,
        reason: "PAYMENT_INVALID",
        msg: "Payment is not valid",
        student: {
          name: student.name,
          email: student.email,
          branch: student.branch,
          year: student.Year
        }
      });
    }

    // Everything is valid
    return res.status(200).json({
      success: true,
      canEnter: true,
      reason: null,
      msg: "Ticket is valid",
      student: {
        name: student.name,
        email: student.email,
        branch: student.branch,
        year: student.Year
      }
    });

  } catch (error) {
    console.error("Scan ticket error:", error);

    return res.status(500).json({
      success: false,
      msg: "Failed to scan ticket"
    });
  }
};



export const allowEntry = async (req, res) => {
  try {
    const { mId } = req.body;

    if (!isValidStudentObjectId(mId)) {
      return res.status(400).json({
        success: false,
        msg: "Invalid student ID"
      });
    }

    const student = await Student.findOneAndUpdate(
      {
        _id: mId,
        isPaid: true,
        isScanned: false
      },
      {
        $set: {
          isScanned: true
        }
      },
      {
        new: true
      }
    ).select("name email branch Year");

    if (!student) {
      // Keep findOneAndUpdate above as the atomic authority. This follow-up
      // read only explains why an atomic update lost a concurrent race or was
      // disallowed; it never changes entry state.
      const currentStudent = await Student.findById(mId).select(
        "isPaid isScanned"
      );

      if (!currentStudent) {
        return res.status(404).json({
          success: false,
          msg: "Student not found"
        });
      }

      if (!currentStudent.isPaid) {
        return res.status(409).json({
          success: false,
          reason: "PAYMENT_INVALID",
          msg: "Payment is not valid"
        });
      }

      return res.status(409).json({
        success: false,
        reason: "ALREADY_SCANNED",
        msg: "Entry already taken"
      });
    }

    return res.status(200).json({
      success: true,
      msg: "Entry allowed",
      student: {
        name: student.name,
        email: student.email,
        branch: student.branch,
        year: student.Year
      }
    });

  } catch (error) {
    console.error("Allow entry error:", error);

    return res.status(500).json({
      success: false,
      msg: "Failed to allow entry"
    });
  }
};

