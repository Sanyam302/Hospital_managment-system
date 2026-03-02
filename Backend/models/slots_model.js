import mongoose from "mongoose";

const slotSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
      index: true,
    },

    date: {
      type: Date,   // Always store as Date, NOT string
      required: true,
      index: true,
    },

    time: {
      type: String, // Example: "10:00"
      required: true,
    },

    isBooked: {
      type: Boolean,
      default: false,
      index: true,
    },

    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    status: {
      type: String,
      enum: ["available", "booked", "cancelled", "expired"],
      default: "available",
      index: true,
    }
  },
  { timestamps: true }
);

/*
 Prevent duplicate slots for same doctor + date + time
*/
slotSchema.index(
  { doctorId: 1, date: 1, time: 1 },
  { unique: true }
);

const Slot = mongoose.model("Slot", slotSchema);

export default Slot;
