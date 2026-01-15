const mongoose = require("mongoose")

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
     match: [
        /^\S+@\S+\.\S+$/,
        "Please enter a valid email address"
      ]
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      match: [
    /^(?=.*[A-Z])(?=.*\d).+$/,
    "Password must contain at least one capital letter and one number"
  ]
    },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true
    },

    age: {
      type: Number,
      required: true,
      min: 0,
      max: 120
    },

    role: {
      type: String,
      enum: ["admin", "doctor", "patient"],
      default: "patient"
    },
    isVerified: {
  type: Boolean,
  default: false
},

otp: {
  type: String
},

otpExpiry: {
  type: Date
}

  },
     
  {
    timestamps: true
  }
)
const userModel =mongoose.model("User", userSchema)
module.exports = userModel
