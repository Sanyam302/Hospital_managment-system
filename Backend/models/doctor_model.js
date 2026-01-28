import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    userId: String,
    name: String,
    email:String,
    age:Number,
    specialization: String,
    hospitalName: String,
    city: String,
    experience: Number,
    fee: Number,
  },
  { timestamps: true }
);
const Doctor = mongoose.model("Doctor", doctorSchema);
export default Doctor

