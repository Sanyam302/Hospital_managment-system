import express from "express";
import Doctor  from "../models/doctor_model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import Availability  from "../models/availability_slots/Availibility.js";
import verifyJWT from "../middleware/authmiddleware.js";
import  Appointment  from "../models/appointment_model.js";
import User from "../models/register.model.js";
import Slot from "../models/slots_model.js";
import upload from "../middleware/upload.js";
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

router.post("/add-slots",verifyJWT, asyncHandler(async (req, res) => {
  try {
    const doctorId = req.user._id; // assuming auth middleware already sets this
    const { date, startTime, endTime } = req.body;

    if (!date || !startTime || !endTime) {
      return res.status(400).json({
        message: "Date, startTime and endTime are required"
      });
    }

    // Normalize date
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return res.status(400).json({
        message: "Cannot create slots for past date"
      });
    }

    // Convert HH:MM to minutes
    const convertToMinutes = (time) => {
      const [hours, minutes] = time.split(":").map(Number);
      return hours * 60 + minutes;
    };

    const convertToTimeString = (minutes) => {
      const hrs = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hrs.toString().padStart(2, "0")}:${mins
        .toString()
        .padStart(2, "0")}`;
    };

    const start = convertToMinutes(startTime);
    const end = convertToMinutes(endTime);

    if (start >= end) {
      return res.status(400).json({
        message: "Invalid time range"
      });
    }

    const slots = [];

    for (let time = start; time < end; time += 30) {
      slots.push({
        doctorId,
        date: selectedDate,
        time: convertToTimeString(time)
      });
    }

    await Slot.insertMany(slots, { ordered: false });

    return res.status(201).json({
      message: "Slots added successfully",
      totalSlots: slots.length
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Some slots already exist for this date"
      });
    }

    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
}));

router.put(
  "/profile_image",
  verifyJWT,
  upload.single("profileImage"),
  async (req, res) => {
    try {
      const updates = req.body;

      if (req.file) {
        updates.profileImage = `/uploads/${req.file.filename}`;
      }

      const doctor = await Doctor.findByIdAndUpdate(
        req.user._id,
        updates,
        { new: true }
      ).select("-password");

      res.json({
        message: "Profile updated",
        doctor
      });

    } catch (error) {
      res.status(500).json({
        message: "Profile update failed"
      });
    }
  }
);

router.put(
  "/profile",
  verifyJWT,
  asyncHandler(async (req, res) => {

    if (req.user.role !== "doctor") {
      throw new ApiError(403, "Access denied");
    }

    const doctorProfile = await Doctor.findOne({
      userId: req.user._id
    });

    if (!doctorProfile) {
      throw new ApiError(404, "Doctor profile not found");
    }

    // Update allowed fields only
    const allowedUpdates = [
      "name",
      "phone",
      "qualification",
      "about",
      "hospitalName",
      "specialization",
      "experience",
      "fee",
      "city",
      "licenseNumber",
      "profileImage",
      "licenseDocument"
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        doctorProfile[field] = req.body[field];
      }
    });

    // Optional: Profile completion logic
    if (
      doctorProfile.specialization &&
      doctorProfile.city &&
      doctorProfile.licenseNumber
    ) {
      doctorProfile.isProfileComplete = true;
    }

    await doctorProfile.save();

    res.status(200).json(
      new ApiResponse(200, doctorProfile, "Profile updated successfully")
    );
  })
);

router.get(
  "/profile",
  verifyJWT,
  asyncHandler(async (req, res) => {

    // Ensure logged in user is doctor
    if (req.user.role !== "doctor") {
      throw new ApiError(403, "Access denied");
    }

    const doctorProfile = await Doctor.findOne({
      userId: req.user._id
    });

    if (!doctorProfile) {
      throw new ApiError(404, "Doctor profile not found");
    }

    res.status(200).json(
      new ApiResponse(200, doctorProfile, "Profile fetched successfully")
    );
  })
);


export default router;
