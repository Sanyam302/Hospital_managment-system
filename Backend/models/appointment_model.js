import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name:{
        type:String,

    },
    email:{
        type:String,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    date: {
      type: String, // "2026-02-10"
      required: true,
    },
    time: {
      type: String, // "10:30"
      required: true,
    },
    msg:{
        type: String
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);
const Appointment = mongoose.model(
  "Appointment",
  appointmentSchema
);
export default Appointment
