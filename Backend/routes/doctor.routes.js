import express from "express";
import Doctor  from "../models/doctor_model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import Availability  from "../models/availability_slots/Availibility.js";
import verifyJWT from "../middleware/authmiddleware.js";
import  Appointment  from "../models/appointment_model.js";
import User from "../models/register.model.js";

const router = express.Router();

router.get("/", asyncHandler(async (req, res) => {
  const doctors = await Doctor.find();
  res.json({ data: doctors });
}));

router.get("/search", async (req, res) => {
  const { city, specialization } = req.query;

  const filter = {};
  if (city) filter.city = city;
  if (specialization) filter.specialization = specialization;

  const doctors = await Doctor.find(filter);
  res.json({ data: doctors });
});


router.post("/complete-profile", verifyJWT, async (req, res) => {
  if (req.user.role !== "doctor") {
    return res.status(403).json({ message: "Only doctors allowed" })
  }

  const { specialization, experience, hospitalName, consultationFee, bio } = req.body

  
  await Doctor.findByIdAndUpdate(req.user._id, {

    specialization,
        experience,
        hospitalName,
        fee: consultationFee,
        bio,
        isProfileComplete: true,  
  },{ new: true, upsert: true }
)

  res.json({
    message: "Profile completed successfully",
    
  })
})

router.post("/slots", verifyJWT, async (req, res) => {
  if (req.user.role !== "doctor") {
    return res.status(403).json({ message: "Only doctors allowed" });
  }

  const { date, slots } = req.body;

  const availability = await Availability.create({
    doctorId: req.user.doctorId, // or mapped doctorId
    date,
    slots,
  });

  res.status(201).json({ data: availability });
});

router.post("/appointment", verifyJWT, async (req, res) => {
  if (req.user.role !== "patient") {
    return res.status(403).json({ message: "Only patients allowed" });
  }

  const { doctorId, date, time } = req.body;

  const availability = await Availability.findOne({ doctorId, date });

  const slot = availability.slots.find(
    (s) => s.time === time && !s.isBooked
  );

  if (!slot) {
    return res.status(400).json({ message: "Slot not available" });
  }

  slot.isBooked = true;
  await availability.save();

  const appointment = await Appointment.create({
    patientId: req.user._id,
    name:req.user.name,
    email:req.user.email,
    doctorId,
    date,
    time,
  });

  res.status(201).json({ data: appointment });
});

router.get("/checkAppointment", verifyJWT, async (req, res) => {
  if (req.user.role !== "doctor") {
    return res.status(403).json({ message: "Access denied" });
  }

  const appointments = await Appointment.find({
    doctorId: req.user.doctorId,
  })
    .populate("patientId", "name email")
    .sort({ createdAt: -1 });

  res.json({ data: appointments });
});

router.patch("/:id/status", verifyJWT, async (req, res) => {
  if (req.user.role !== "doctor") {
    return res.status(403).json({ message: "Access denied" });
  }

  const { status } = req.body;

  const appointment = await Appointment.findByIdAndUpdate(
    req.params._id,
    { status },
    { new: true }
  );

  res.json({ data: appointment });
});

router.get("/patientDashboard", verifyJWT, async (req, res) => {
  if (req.user.role !== "patient") {
    return res.status(403).json({ message: "Access denied" });
  }

  const appointments = await Appointment.find({
    patientId: req.user._id,
  })
    .populate("doctorId", "name specialization hospitalName")
    .sort({ createdAt: -1 });

  res.json({ data: appointments });
});



export default router;
