
import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    specialization: String,
    phone: Number,
    experience: Number,
    qualification: String,
    fee: Number,
    about: String,
    hospitalName: String,
    city: String,

    profileImage: {
      type: String, // image URL or file path
    },

    licenseNumber: String,
    licenseDocument: String,

    isProfileComplete: {
      type: Boolean,
      default: false
    }
    
  },
  { timestamps: true }
);

const Doctor = mongoose.model("Doctor", doctorSchema);
export default Doctor;
