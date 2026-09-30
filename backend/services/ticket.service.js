import qrcode from "qrcode";
import { createCanvas, Image, registerFont } from "canvas";
import sharp from "sharp";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import Student from "../models/student.model.js";
import resendSendEmail from "../utils/ticket/resendSendMail.js";


// ES Module __dirname setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// CONSTANTS

const WIDTH = 1250;
const HEIGHT = 418;

// GENERATE QR CODE

export async function generateQRCode(data) {
  return await qrcode.toBuffer(data, {
    type: "png",
    errorCorrectionLevel: "H",
    margin: 0,
    version: 10,
    color: {
      dark: "#ffffff",
      light: "#00000000"
    }
  });
}


// PROCESS STUDENT TICKET

export const processStudentTicket = async (mId) => {

  try {

    // 1. FIND STUDENT

    const student = await Student.findById(mId);

    if (!student) {
      throw new Error("Student not found");
    }


    // 2. CHANGE STATUS
    // QUEUED → PROCESSING

    const processingResult = await Student.updateOne(
      {
        _id: mId,
        ticketStatus: "QUEUED"
      },
      {
        $set: {
          ticketStatus: "PROCESSING"
        }
      }
    );

    if (processingResult.modifiedCount !== 1) {
      throw new Error(
        `Invalid ticket state for student ${mId}`
      );
    }


    // 3. GENERATE QR CODE

    const qrPayload = JSON.stringify({
      mId: student._id.toString(),
      name: student.name,
      branch: student.branch,
      year: student.Year,
    });

    const qrBuffer = await generateQRCode(qrPayload);


    // 4. FILE PATHS

    const ticketPath = path.join(
      __dirname,
      "../assets/ticket.png"
    );

    const fontPath1 = path.join(
      __dirname,
      "../assets/fonts/Merienda/Merienda-regular.ttf"
    );

    const fontPath2 = path.join(
      __dirname,
      "../assets/fonts/Bebas_Neue/BebasNeue-Regular.ttf"
    );


    // Make sure required files exist
    await fs.access(ticketPath);
    await fs.access(fontPath1);
    await fs.access(fontPath2);


    // 5. REGISTER FONTS

    registerFont(fontPath1, {
      family: "Merienda"
    });

    registerFont(fontPath2, {
      family: "Bebas Neue"
    });


    // 6. LOAD BACKGROUND IMAGE

    const bgBuffer = await fs.readFile(ticketPath);

    const bgImage = new Image();

    bgImage.src = bgBuffer;


    // 7. CREATE CANVAS

    const canvas = createCanvas(
      WIDTH,
      HEIGHT
    );

    const ctx = canvas.getContext("2d");


    // Draw background
    ctx.drawImage(
      bgImage,
      0,
      0,
      WIDTH,
      HEIGHT
    );


    // 8. QR CODE

    const qrWidth = 198;
    const qrHegiht = 198;

    const qrX = 104;

    const qrY = 110;


    const resizedQr = await sharp(qrBuffer)
      .resize(qrWidth, qrHegiht)
      .toBuffer();


    const qrImage = new Image();

    qrImage.src = resizedQr;


    ctx.drawImage(
      qrImage,
      qrX,
      qrY,
      qrWidth,
      qrHegiht
    );


// 9. TEXT SECTION

const textX = 758;

ctx.fillStyle = "#000000";
ctx.textAlign = "left";
ctx.textBaseline = "alphabetic";


// ==========================================
// AUTO FONT SIZE
// ==========================================

const fitFontSize = (
  text,
  fontFamily,
  maxWidth,
  maxSize,
  minSize = 30,
  step = 1
) => {

  let size = maxSize;

  ctx.font = `${size}px ${fontFamily}`;

  while (
    ctx.measureText(text).width > maxWidth &&
    size > minSize
  ) {

    size -= step;

    ctx.font = `${size}px ${fontFamily}`;
  }

  return size;
};


// ==========================================
// TEXT WIDTH
// ==========================================

// 100px space on the right
const rightMargin = 100;

const maxTextWidth =
  WIDTH - textX - rightMargin;


// ==========================================
// NAME
// ==========================================

const nameText =
  student.name.toUpperCase();

const nameFont =
  "Bebas Neue";

const nameSize = fitFontSize(
  nameText,
  nameFont,
  maxTextWidth,
  65,
  40,
  1
);

ctx.font =
  `${nameSize}px ${nameFont}`;

ctx.fillText(
  nameText,
  textX,
  175
);


// ==========================================
// BRANCH + YEAR
// ==========================================

const yearText =
  student.Year === 1 ? "1ST YEAR" :
  student.Year === 2 ? "2ND YEAR" :
  student.Year === 3 ? "3RD YEAR" :
  `${student.Year}TH YEAR`;

const branchText =
  String(student.branch || "").toUpperCase();

const branchYearText =
  `${branchText}, ${yearText}`;

const branchYearFont =
  "Bebas Neue";

const branchYearSize = fitFontSize(
  branchYearText,
  branchYearFont,
  maxTextWidth,
  60,
  40,
  1
);

ctx.font =
  `${branchYearSize}px ${branchYearFont}`;

ctx.fillText(
  branchYearText,
  textX ,
  245
);


    // 10. FINAL TICKET IMAGE

    const finalBuffer =
      canvas.toBuffer("image/png");


    // 11. EMAIL

    const emailSubject =
      "Renaissance — Festival Pass & Login";


    const emailBody = `
      <div style="font-family: Arial; padding:20px">

        <p>Hi ${student.name},</p>

        <p>
          Thanks for signing up for JECRC's
          National Techno-Cultural Fest —
          <strong>Renaissance 2026</strong> 🎉
        </p>

        <p>
          You're officially on the list,
          and trust us—you don't want to miss this.
        </p>

        <p>
          The official fest website is live —
          visit
          <a href="https://jecrcrenaissance.co.in">
            jecrcrenaissance.co.in
          </a>
        </p>

        <p>
          Your festival ticket is attached
          to this email.
        </p>

        <p>
          Got questions or need help?
          Just hit us up — we're here at
          our insta handle @jecrcrenaissance.
        </p>

        <p>
          Get ready to vibe, build,
          and celebrate ✨
        </p>

        <p>
          See you at Renaissance 2026!
        </p>

        <p>
          Renaissance,<br/>
          JECRC
        </p>

      </div>
    `;


    const attachments = [
      {
        filename: "RenaissancePass.png",
        content: finalBuffer
      }
    ];


    // 12. SEND EMAIL

    await resendSendEmail(
      student.email,
      emailSubject,
      emailBody,
      attachments
    );


    // 13. EVERYTHING SUCCESSFUL

    await Student.updateOne(
      {
        _id: mId,
        ticketStatus: "PROCESSING"
      },
      {
        $set: {
          ticketStatus: "SENT",
          isPaid: true
        }
      }
    );


    console.log(
      `✅ Ticket generated and emailed to ${student.email}`
    );


    return {
      success: true,
      mId: student._id,
      ticketStatus: "SENT"
    };


  } catch (error) {

    // 14. ANYTHING FAILED

    console.error(
      `❌ Ticket processing failed for ${mId}:`,
      error?.message || error
    );


    await Student.updateOne(
      {
        _id: mId
      },
      {
        $set: {
          ticketStatus: "FAILED",
          isPaid: false
        }
      }
    );


    // VERY IMPORTANT:
    // Throw the error so the queue/controller
    // also knows that the job failed.

    throw error;
  }
};