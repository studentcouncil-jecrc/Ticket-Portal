import {body} from "express-validator";

export const validateCreateAdmin = [

    body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),

    body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email")
    .normalizeEmail(),

body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

body("role")
    .notEmpty()
    .withMessage("Role is required")
    .isIn(["superadmin", "admin", "hod", "dean"])
    .withMessage("Invalid role"),

body("branch")
    .if((value, { req }) => req.body.role === "hod")
    .notEmpty()
    .withMessage("Branch is required for HOD")
    .isIn(["CSE", "CSAI", "AIDS", "IT", "ECE", "EE", "ME", "CE"])
    .withMessage("Invalid branch"),

body("year")
    .if((value, { req }) => req.body.role === "dean")
    .notEmpty()
    .withMessage("Year is required for Dean")
    .isInt({ min: 1, max: 4 })
    .withMessage("Year must be between 1 and 4")
    .toInt()
];




export const validateAdminLogin = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
];






