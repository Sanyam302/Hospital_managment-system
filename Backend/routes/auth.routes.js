import express from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";

import User from "../models/register.model.js";
import sendOTPEmail from "../utils/nodemailer.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import verifyJWT from "../middleware/authmiddleware.js";
import  Doctor  from "../models/doctor_model.js";

const router = express.Router();




/* ================= TOKEN GENERATOR ================= */

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = jwt.sign(
      { _id: user._id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1500m" }
    );

    const refreshToken = jwt.sign(
      { _id: user._id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "15d" }
    );

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, error.message);
  }
};

/* ================= REGISTER ================= */

router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const { name, email, password, gender, age ,role} = req.body;

    if (!email) {
      throw new ApiError(400, "Email is required");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isVerified) {
      throw new ApiError(400, "User already exists");
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = Date.now() + 10 * 60 * 1000;

    const hashedPassword = await bcrypt.hash(password, 10);

    await sendOTPEmail(email, otp);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      gender,
      age,
      role,
      isVerified: false,
      otp,
      otpExpiry,
    });

    if (role === "doctor") {
  await Doctor.create({
    userId: user._id,
    specialization: "General", // temporary
    hospitalName: "Not Assigned",
    city: "Unknown",
    experience: 0,
    fee: 0,
  });
}

    res
      .status(201)
      .json(new ApiResponse(201, {}, "OTP sent to email"));
  })
);

/* ================= LOGIN ================= */

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // 1️⃣ Validate input
    if (!email || !password) {
      throw new ApiError(400, "Email and password are required");
    }

    // 2️⃣ Find user (exclude password initially)
    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError(401, "User not found");
    }

    // 3️⃣ Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new ApiError(401, "Invalid credentials");
    }

    // 4️⃣ Generate tokens
    const { accessToken, refreshToken } =
      await generateAccessAndRefreshToken(user._id);

    // 5️⃣ Remove password before sending response
    const userWithoutPassword = await User.findById(user._id).select("-password");

    // 6️⃣ Prepare response data
    let responseData = {
      user: userWithoutPassword,
      role: user.role,
      accessToken,
      isProfileComplete:false
    };

    // 7️⃣ If doctor → check profile
    if (user.role === "doctor") {
      const doctorProfile = await Doctor.findOne({ _id: user._id });

      responseData.isProfileComplete = doctorProfile.isProfileComplete;
    }

    // 8️⃣ Cookie options
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    };

    // 9️⃣ Send response
    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          responseData,
          "User logged in successfully"
        )
      );
  })
);

/* ================= VERIFY OTP ================= */

router.post(
  "/verify-otp",
  asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) throw new ApiError(400, "User not found");

    if (user.isVerified) {
      throw new ApiError(400, "User already verified");
    }

    if (user.otp !== otp || user.otpExpiry < Date.now()) {
      throw new ApiError(400, "Invalid or expired OTP");
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.json(new ApiResponse(200, {}, "Email verified successfully"));
  })
);

/* ================= LOGOUT ================= */

router.post(
  "/logout",
  verifyJWT,
  asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, {
      $unset: { refreshToken: 1 },
    });

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };

    res
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new ApiResponse(200, {}, "User logged out"));
  })
);

/* ================= REFRESH TOKEN ================= */

router.post(
  "/refreshToken",
  asyncHandler(async (req, res) => {
    const incomingRefreshToken =
      req.cookies?.refreshToken || req.body?.refreshToken;

    if (!incomingRefreshToken) {
      return res.status(401).json({
        message: "Refresh token missing",
      });
    }

    let decoded;

    try {
      decoded = jwt.verify(
        incomingRefreshToken,
        process.env.JWT_SECRET_KEY
      );
    } catch {
      return res.status(401).json({
        message: "Invalid refresh token",
      });
    }

    const user = await User.findById(decoded._id);

    if (!user || user.refreshToken !== incomingRefreshToken) {
      return res.status(401).json({
        message: "Refresh token expired or reused",
      });
    }

    const { accessToken, refreshToken } =
      await generateAccessAndRefreshToken(user._id);

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    };

    return res
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({
        success: true,
        accessToken,
      });
  })
);
router.get(
  "/me",
  verifyJWT,
  asyncHandler(async (req, res) => {
    res.status(200).json(
      new ApiResponse(
        200,
        { user: req.user },
        "User fetched successfully"
      )
    );
  })
);



export default router;
