import { asyncHandler } from "../utils/asyncHandler";
import express from "express";
import verifyJWT from "../middleware/authmiddleware.js";
import Appointment from "../models/appointment_model.js";
import User from "../models/register.model.js";
import Doctor from "../models/doctor_model.js";

const router = express.Router();

router.post("/book",verifyJWT,asyncHandler(async (req, res) => {
  try {
    const patientId = req.user._id;
    const { slotId } = req.body;

    if (!slotId) {
      return res.status(400).json({
        message: "Slot ID is required"
      });
    }

    // 🔥 Atomic booking
    const slot = await Slot.findOneAndUpdate(
      {
        _id: slotId,
        isBooked: false,
        status: "available"
      },
      {
        $set: {
          isBooked: true,
          status: "booked",
          patientId: patientId
        }
      },
      { new: true }
    );

    if (!slot) {
      return res.status(400).json({
        message: "Slot already booked or not available"
      });
    }

    // Create appointment record
    const appointment = await Appointment.create({
      doctorId: slot.doctorId,
      patientId,
      slotId: slot._id,
      date: slot.date,
      time: slot.time
    });

    return res.status(201).json({
      message: "Appointment booked successfully",
      appointment
    });

  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
}));

export default router;