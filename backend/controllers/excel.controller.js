import fs from "fs";
import Student from "../models/student.model.js";

import { normalizeBranch } from "../utils/excel/branchNormalizer.js";
import { normalizeExcel } from "../utils/excel/excelNormalizer.js";

export const uploadExcel = async (req, res) => {
  try {

    // 1. Check file

    if (!req.file) {
      return res.status(400).json({
        success: false,
        msg: "No file uploaded"
      });
    }


    // 2. Read and normalize Excel

    const {
      rows,
      errors: parseErrors,
      sheets
    } = await normalizeExcel(req.file.path);


    const inserted = [];
    const skipped = [];
    const duplicateSkipped = [];


    // 3. Prepare candidates

    const candidates = [];

    // Detect duplicate emails and
    // Roll Nos inside the same Excel
    const seenEmails = new Set();
    const seenStudentIds = new Set();


    for (const record of rows) {

      const {
        sheet,
        row,
        data
      } = record;


      const {
        name,
        studentId,
        email,
        branch,
        year
      } = data;



      // Required fields


      if (
        !name ||
        !studentId ||
        !email ||
        !branch ||
        !year
      ) {

        skipped.push({
          sheet,
          row,
          reason: "Missing required fields"
        });

        continue;
      }



      // Normalize branch & year


      const normalizedBranch =
        normalizeBranch(branch);

      const parsedYear =
        parseInt(year);


      if (
        !normalizedBranch ||
        !parsedYear
      ) {

    skipped.push({
        sheet,
        row,
        branch,
        year,
        normalizedBranch,
        parsedYear,
        reason: !normalizedBranch
            ? "Invalid branch"
            : "Invalid year"
    });

    continue;
      }



      // Normalize email


      const normalizedEmail =
        email.trim().toLowerCase();



      // Normalize Roll No


      const normalizedStudentId =
        studentId.trim();



      // Duplicate email inside Excel


      if (
        seenEmails.has(normalizedEmail)
      ) {

        duplicateSkipped.push({
          sheet,
          row,
          email: normalizedEmail,
          reason: "Duplicate email in batch"
        });

        continue;
      }



      // Duplicate Roll No inside Excel


      if (
        seenStudentIds.has(normalizedStudentId)
      ) {

        duplicateSkipped.push({
          sheet,
          row,
          studentId: normalizedStudentId,
          reason: "Duplicate Roll No in batch"
        });

        continue;
      }


      seenEmails.add(normalizedEmail);
      seenStudentIds.add(normalizedStudentId);



      // Add candidate


      candidates.push({
        sheet,
        row,

        name: name.trim(),

        studentId: normalizedStudentId,

        email: normalizedEmail,

        branch: normalizedBranch,

        Year: parsedYear
      });
    }


    // 4. Check existing students

    const emails = candidates.map(
      (student) => student.email
    );


    const studentIds = candidates.map(
      (student) => student.studentId
    );


    const existingStudents = await Student
      .find({
        $or: [
          {
            email: {
              $in: emails
            }
          },
          {
            studentId: {
              $in: studentIds
            }
          }
        ]
      })
      .select("email studentId");


    // Existing emails
    const existingEmails = new Set(
      existingStudents.map(
        (student) => student.email
      )
    );


    // Existing Roll Nos
    const existingStudentIds = new Set(
      existingStudents.map(
        (student) => student.studentId
      )
    );


    // 5. Remove existing students

    const toInsert = [];


    for (const student of candidates) {

      const {
        sheet,
        row,
        name,
        studentId,
        email,
        branch,
        Year
      } = student;



      // Existing email


      if (
        existingEmails.has(email)
      ) {

        duplicateSkipped.push({
          sheet,
          row,
          email,
          reason:
            "Student email already exists in database"
        });

        continue;
      }



      // Existing Roll No


      if (
        existingStudentIds.has(studentId)
      ) {

        duplicateSkipped.push({
          sheet,
          row,
          studentId,
          reason:
            "Roll No already exists in database"
        });

        continue;
      }



      // Prepare document


      toInsert.push({
        name,

        studentId,

        email,

        branch,

        Year,

      });
    }


    // 6. Bulk insert

    const BATCH = 500;


    for (
      let i = 0;
      i < toInsert.length;
      i += BATCH
    ) {

      const batch =
        toInsert.slice(
          i,
          i + BATCH
        );


      try {

        const insertedDocs =
          await Student.insertMany(
            batch,
            {
              ordered: false
            }
          );


        console.log(
          `Batch insert: inserted ${insertedDocs.length} students`
        );


        inserted.push(
          ...insertedDocs
        );


      } catch (err) {


        // Handle partial insert


        if (
          err &&
          err.insertedDocs &&
          err.insertedDocs.length
        ) {

          console.log(
            `Partial insert: inserted ${err.insertedDocs.length} students`
          );


          inserted.push(
            ...err.insertedDocs
          );
        }


        console.error(
          "Partial insert error:",
          err.message || err
        );
      }
    }


    // 7. Delete uploaded file

    if (
      fs.existsSync(req.file.path)
    ) {
      fs.unlinkSync(req.file.path);
    }


console.log("========== DUPLICATES ==========");

duplicateSkipped.forEach((duplicate) => {
  console.log(
    `Sheet: ${duplicate.sheet} | Row: ${duplicate.row} | ` +
    `Email: ${duplicate.email || "N/A"} | ` +
    `Roll No: ${duplicate.studentId || "N/A"} | ` +
    `Reason: ${duplicate.reason}`
  );
});

console.log("Total duplicates:", duplicateSkipped.length);
console.log("================================");


    // 8. Response

    return res.status(201).json({

      success: true,

      summary: {

        totalRows:
          rows.length,

        inserted:
          inserted.length,

        skipped:
          skipped.length,

        duplicateSkipped:
          duplicateSkipped.length,

        totalSkipped:
          skipped.length +
          duplicateSkipped.length
      },

      sheets,

      skipped:
        skipped.slice(0, 100),

      duplicates:
        duplicateSkipped.slice(0, 100),

      parseErrors
    });


  } catch (error) {

    console.error(
      "Upload Excel error:",
      error
    );


    // Delete uploaded file on error

    if (
      req.file &&
      fs.existsSync(req.file.path)
    ) {

      fs.unlinkSync(
        req.file.path
      );
    }


    return res.status(500).json({
      success: false,
      msg: "Excel Upload failed"
    });
  }
};