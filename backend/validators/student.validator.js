import { body } from "express-validator";

export const validateAddStudent = [

  body("name")
    .trim()
    .notEmpty()
    .withMessage("Student name is required"),

  body("studentId")
    .trim()
    .notEmpty()
    .withMessage("Student ID is required"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Student email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("branch")
    .trim()
    .notEmpty()
    .withMessage("Branch is required")
    .isIn(["CSE", "CSAI", "AIDS", "IT", "ECE", "EE", "ME", "CE"])
    .withMessage("Invalid branch"),

  body("Year")
    .notEmpty()
    .withMessage("Year is required")
    .isInt({ min: 1, max: 4 })
    .withMessage("Year must be between 1 and 4"),

  body("phone")
    .optional({ nullable: true })
    .trim()
    .isMobilePhone("any")
    .withMessage("Please provide a valid phone number"),

];