import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    name: String,
    email:String,
    age:Number,
    specialization: String,
    hospitalName: String,
    city: String,
    experience: Number,
    fee: Number,
    bio: String,
    isProfileComplete: {
  type: Boolean,
  default: false
}
  },
  { timestamps: true }
);
const Doctor = mongoose.model("Doctor", doctorSchema);
export default Doctor

