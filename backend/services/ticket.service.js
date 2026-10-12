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

const WIDTH = 866;
const HEIGHT = 1636;

// GENERATE QR CODE

export async function generateQRCode(data) {
  return await qrcode.toBuffer(data, {
    type: "png",
    errorCorrectionLevel: "H",
    margin: 0,
    version: 10,
    color: {
      dark: "#000000",
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

const emailerPath = path.join(
  __dirname,
  "../assets/emailer.png"
);

const emailerBuffer = await fs.readFile(emailerPath);


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

    const qrWidth = 546;
    const qrHegiht = 546;

    const qrX = 160;

    const qrY = 330;


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

const textX = 225;

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
  80,
  40,
  1
);

ctx.font =
  `${nameSize}px ${nameFont}`;

ctx.fillText(
  nameText,
  textX,
  1364
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
  80,
  40,
  1
);

ctx.font =
  `${branchYearSize}px ${branchYearFont}`;

ctx.fillText(
  branchYearText,
  textX ,
  1434
);


    // 10. FINAL TICKET IMAGE

    const finalBuffer =
      canvas.toBuffer("image/png");


    // 11. EMAIL

    const emailSubject =
      "🎟️ Your Entry Pass for Navrang '26 | JECRC";


const emailBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>

<body style="margin:0; padding:0; background-color:#f4f4f7; font-family:Arial, Helvetica, sans-serif; color:#292735;">

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
    style="background-color:#f4f4f7; padding:24px 10px;">

    <tr>
      <td align="center">

        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"
          style="width:100%; max-width:600px; background-color:#ffffff; border:1px solid #e8e5ee; border-radius:12px; overflow:hidden;">

          <!-- HEADER IMAGE -->
          <tr>
            <td align="center"
              style="background-color:#0D5BA9; padding:0;">

<img
  src="cid:emailer"
  alt="Navrang '26"
  width="600"
  style="display:block; width:100%; max-width:600px; height:auto; border:0;"
/>

            </td>
          </tr>

          <!-- INTRODUCTION -->
          <tr>
            <td style="padding:32px 30px 18px;">

              <h2 style="margin:0 0 14px; font-size:23px; line-height:1.4; color:#292735;">
                Greetings from Student Council, JECRC
              </h2>

              <p style="margin:0; font-size:15px; line-height:1.8; color:#686673;">
                Thank you for registering for Navrang '26! Your official entry pass
                is attached to this email. Please present it at the event entrance
                for scanning.
              </p>

            </td>
          </tr>

          <!-- EVENT DETAILS -->
          <tr>
            <td style="padding:12px 30px 24px;">

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                style="background-color:#faf8fd; border:1px solid #e9e3f2; border-radius:10px;">

                <tr>
                  <td style="padding:17px 18px; border-bottom:1px solid #e9e3f2;">

                    <div style="font-size:12px; font-weight:bold; letter-spacing:1px; color:#858095;">
                      DATE
                    </div>

                    <div style="margin-top:6px; font-size:16px; font-weight:bold; color:#34313e;">
                      Friday, 9th October 2026
                    </div>

                  </td>
                </tr>

                <tr>
                  <td style="padding:17px 18px; border-bottom:1px solid #e9e3f2;">

                    <div style="font-size:12px; font-weight:bold; letter-spacing:1px; color:#858095;">
                      VENUE
                    </div>

                    <div style="margin-top:6px; font-size:16px; font-weight:bold; color:#34313e;">
                      Central Lawn, JECRC
                    </div>

                  </td>
                </tr>

                <tr>
                  <td style="padding:17px 18px;">

                    <div style="font-size:12px; font-weight:bold; letter-spacing:1px; color:#858095;">
                      TIME
                    </div>

                    <div style="margin-top:6px; font-size:16px; font-weight:bold; color:#34313e;">
                      5:00 PM onwards
                    </div>

                  </td>
                </tr>

              </table>

            </td>
          </tr>

          <!-- IMPORTANT INFORMATION -->
          <tr>
            <td style="padding:0 30px 26px;">

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                style="background-color:#fff7e9; border:1px solid #f4dfb9; border-radius:10px;">

                <tr>
                  <td style="padding:20px 20px 10px;">

                    <h3 style="margin:0; font-size:18px; line-height:1.5; color:#67471a;">
                      ⚠ Important information
                    </h3>

                  </td>
                </tr>

                <tr>
                  <td style="padding:0 20px 18px;">

                    <ul style="margin:0; padding-left:20px; font-size:14px; line-height:1.8; color:#625748;">

                      <li style="padding-bottom:10px;">
                        Entry gates will be closed by 5:00 PM.
                      </li>

                      <li style="padding-bottom:10px;">
                        Entry is permitted only on showing both your ID card and this pass.
                      </li>

                      <li style="padding-bottom:10px;">
                        This pass is valid for one person only and cannot be transferred.
                      </li>

                      <li style="padding-bottom:10px;">
                        Once you exit the college premises, re-entry is not permitted.
                      </li>

                      <li style="padding-bottom:10px;">
                       Outside food, drinks and prohibited items are not allowed inside the venue.
                      </li>

                      <li>
                        The organizing team reserves the right to remove anyone found creating a disturbance or involved in any act of indiscipline from the college premises. Kindly adhere to the rules and regulations.
                      </li>

                    </ul>

                  </td>
                </tr>

              </table>

            </td>
          </tr>

          <!-- CLOSING -->
          <tr>
            <td align="center" style="padding:4px 30px 30px;">

              <p style="margin:12px 0 5px; font-size:15px; color:#686673;">
                See You on Dance Floor!
              </p>

              <p style="margin:0; font-size:15px; line-height:1.8; font-weight:bold; color:#34313e;">
                Student Council, JECRC
              </p>

            </td>
          </tr>

          <!-- CONTACT SECTION -->
          <tr>
            <td style="padding:0 30px 28px;">

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                style="background-color:#f7f4fa; border-radius:10px;">

                <tr>
                  <td align="center" style="padding:22px 15px;">

                    <p style="margin:0 0 15px; font-size:13px; color:#858095;">
                      Questions? Reach the Student Council:
                    </p>

                    <p style="margin:0; font-size:14px; line-height:2;">

                      <a href="mailto:studentcouncil@jecrc.ac.in"
                        style="color:#5c469f; text-decoration:underline;">
                        studentcouncil@jecrc.ac.in
                      </a>

                      <br>

                      <a href="tel:+918239022830"
                        style="color:#5c469f; text-decoration:underline;">
                        +91 82390 22830
                      </a>

                    </p>

                  </td>
                </tr>

              </table>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td align="center"
              style="padding:20px 24px; border-top:1px solid #eeeaf2;">

              <p style="margin:0; font-size:12px; line-height:1.7; color:#9692a0;">
                You're receiving this email because you registered for Navrang '26.
              </p>

            </td>
          </tr>

        </table>

      </td>
    </tr>

  </table>

</body>
</html>
`;


const attachments = [
  {
    filename: "NavrangPass.png",
    content: finalBuffer
  },
  {
    filename: "emailer.png",
    content: emailerBuffer,
    contentId: "emailer"
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