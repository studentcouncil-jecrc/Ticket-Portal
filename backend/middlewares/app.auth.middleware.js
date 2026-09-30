import jwt from "jsonwebtoken";
import AppAdmin from "../models/app.admin.model.js";
import BlacklistedToken from "../models/blacklistToken.model.js";

export const authAppAdminMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        msg: "Authentication required"
      });
    }

    const token = authHeader.split(" ")[1];

    const blacklistedToken = await BlacklistedToken.findOne({ token });

    if (blacklistedToken) {
      return res.status(401).json({
        success: false,
        msg: "Token has been revoked"
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.APP_ADMIN_JWT_SECRET
    );

    const appAdmin = await AppAdmin.findById(decoded.id);

    if (!appAdmin) {
      return res.status(401).json({
        success: false,
        msg: "App admin not found"
      });
    }

    if (!appAdmin.isLoggedIn) {
      return res.status(401).json({
        success: false,
        msg: "Session expired or logged out"
      });
    }

    req.appAdmin = appAdmin;
    req.appToken = token;

    next();

  } catch (error) {
    console.error("App admin auth error:", error);

    return res.status(401).json({
      success: false,
      msg: "Invalid or expired token"
    });
  }
};