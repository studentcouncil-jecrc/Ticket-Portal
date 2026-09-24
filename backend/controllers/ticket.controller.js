import Student from "../models/student.model.js";
import enqueueEmail from "../utils/ticket/emailQueue.js";
import { processStudentTicket } from "../services/ticket.service.js";



export const sendTicket = async (req, res) => {
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

    // ALREADY PAID → UNCHECK
    if (student.isPaid === true) {
      await Student.updateOne(
        { _id: id },
        {
          $set: {
            isPaid: false,
            markedBy: null,
            markedAt: null
          }
        }
      );

      return res.status(200).json({
        success: true,
        msg: "Payment revoked",
        isPaid: false,
        ticketStatus: student.ticketStatus,
        email:student.email
      });
    }

    // TICKET ALREADY SENT
    // Just mark payment as paid.
    // No need to generate/send again.
    if (student.ticketStatus === "SENT") {
      await Student.updateOne(
        { _id: id },
        {
          $set: {
            isPaid: true,
            markedBy: req.user.id,
            markedAt: new Date()
          }
        }
      );

      return res.status(200).json({
        success: true,
        msg: "Payment marked",
        isPaid: true,
        ticketStatus: "SENT"
      });
    }

    // ALREADY QUEUED / PROCESSING
    if (
      student.ticketStatus === "QUEUED" ||
      student.ticketStatus === "PROCESSING"
    ) {
      return res.status(409).json({
        success: false,
        msg: "Ticket is already being processed",
        ticketStatus: student.ticketStatus
      });
    }

    // NEW / FAILED
    // Move to QUEUED

    const result = await Student.updateOne(
      {
        _id: id,
        isPaid: false,
        ticketStatus: {
          $in: ["NOT_SENT", "FAILED"]
        }
      },
      {
        $set: {
          ticketStatus: "QUEUED"
        }
      }
    );

    if (result.modifiedCount !== 1) {
      return res.status(409).json({
        success: false,
        msg: "Student state changed, please try again"
      });
    }

    // Start ticket processing
enqueueEmail(() => processStudentTicket(id))
  .catch(async (err) => {
    console.error("Ticket processing failed:", err?.message || err);

    await Student.updateOne(
      { _id: id },
      {
        $set: {
          ticketStatus: "FAILED",
          isPaid: false
        }
      }
    );
  });

    return res.status(200).json({
      success: true,
      msg: "Ticket processing queued",
      isPaid: false,
      ticketStatus: "QUEUED"
    });

  } catch (err) {
    console.error("Toggle payment error:", err);

    return res.status(500).json({
      success: false,
      msg: "Payment update failed"
    });
  }
};