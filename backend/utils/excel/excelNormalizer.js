import ExcelJS from "exceljs";

const headerValueToString = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "object") {
    if (value.text) {
      return value.text;
    }

    if (value.richText) {
      return value.richText
        .map((t) => t.text)
        .join("");
    }

    if (value.result !== undefined) {
      return String(value.result);
    }
  }

  return String(value);
};


const normalizeHeader = (value) =>
  headerValueToString(value)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .trim();


export async function normalizeExcel(filePath) {

  const workbook = new ExcelJS.Workbook();

  await workbook.xlsx.readFile(filePath);

  const rows = [];
  const errors = [];
  const sheets = [];


  // Process every sheet
  workbook.eachSheet((worksheet) => {

    // Search first 20 rows for headers
    const maxHeaderSearch =
      Math.min(20, worksheet.rowCount || 20);

    let headerRowIndex = null;
    let columnMap = {};


    // Find header row

    for (
      let r = 1;
      r <= maxHeaderSearch;
      r++
    ) {

      const headerRow = worksheet.getRow(r);

      const tempMap = {};


      headerRow.eachCell((cell, col) => {

        if (!cell.value) return;

        const header =
          normalizeHeader(cell.value);


        // Name
        if (header.includes("name")) {
          tempMap.name = col;
        }

        // Roll No / Roll Number / Student ID
        else if (
          header.includes("rollno") ||
          header.includes("rollnumber") ||
          header.includes("studentid")
        ) {
          tempMap.studentId = col;
        }

        // Email
        else if (header.includes("email")) {
          tempMap.email = col;
        }

        // Branch / Department
        else if (
          header.includes("branch") ||
          header.includes("dept")
        ) {
          tempMap.branch = col;
        }

        // Year / Class
        else if (
          header.includes("year") ||
          header.includes("class")
        ) {
          tempMap.year = col;
        }

      });



      // Accept header only when all
      // required columns are present


      const hasRequiredColumns =
        tempMap.name &&
        tempMap.studentId &&
        tempMap.email &&
        tempMap.branch &&
        tempMap.year;


      if (hasRequiredColumns) {

        headerRowIndex = r;
        columnMap = tempMap;

        break;
      }
    }


    // Sheet information

    sheets.push({
      sheet: worksheet.name,
      headerRowIndex,
      columns: Object.keys(columnMap)
    });


    // No valid header found
    if (!headerRowIndex) {
      return;
    }


    // Convert Excel cell to string

    const cellToString = (cell) => {

      if (
        !cell ||
        cell.value === null ||
        cell.value === undefined
      ) {
        return null;
      }


      let value = cell.value;


      if (typeof value === "object") {

        if (value.text) {
          value = value.text;
        }

        else if (value.richText) {
          value = value.richText
            .map((t) => t.text)
            .join("");
        }

        else if (
          value.result !== undefined
        ) {
          value = value.result;
        }

        else {
          value = JSON.stringify(value);
        }
      }


      return String(value).trim();
    };


    // Read student rows

    for (
      let rowNumber = headerRowIndex + 1;
      rowNumber <= worksheet.rowCount;
      rowNumber++
    ) {

      const row =
        worksheet.getRow(rowNumber);

      if (!row) continue;


      try {

        const record = {
          sheet: worksheet.name,
          row: rowNumber,
          data: {}
        };



        // Name


        const name = cellToString(
          row.getCell(columnMap.name)
        );

        if (name) {
          record.data.name = name;
        }



        // Roll No → studentId


        const studentId = cellToString(
          row.getCell(columnMap.studentId)
        );

        if (studentId) {
          record.data.studentId = studentId;
        }



        // Email


        const email = cellToString(
          row.getCell(columnMap.email)
        );

        if (email) {
          record.data.email = email;
        }



        // Branch


        const branch = cellToString(
          row.getCell(columnMap.branch)
        );

        if (branch) {
          record.data.branch = branch;
        }



        // Year


        const yearCell =
          row.getCell(columnMap.year);

        const year =
          typeof yearCell.value === "number"
            ? yearCell.value
            : cellToString(yearCell);


        if (
          year !== null &&
          year !== undefined &&
          year !== ""
        ) {
          record.data.year = year;
        }



        // Ignore completely empty rows


        if (
          Object.keys(record.data).length === 0
        ) {
          continue;
        }


        rows.push(record);


      } catch (err) {

        errors.push({
          sheet: worksheet.name,
          row: rowNumber,
          reason: err.message
        });
      }
    }
  });


  return {
    rows,
    errors,
    sheets
  };
}