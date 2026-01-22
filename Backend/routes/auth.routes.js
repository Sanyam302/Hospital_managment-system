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

const router = express.Router();

/* ================= TOKEN GENERATOR ================= */

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = jwt.sign(
      { _id: user._id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "15m" }
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
    const { name, email, password, gender, age } = req.body;

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
      role: "patient",
      isVerified: false,
      otp,
      otpExpiry,
    });

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

    const user = await User.findOne({ email });
    if (!user) throw new ApiError(401, "User not found");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new ApiError(401, "Invalid credentials");

    const { accessToken, refreshToken } =
      await generateAccessAndRefreshToken(user._id);

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    };

    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { user, accessToken },
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
      req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decoded = jwt.verify(
      incomingRefreshToken,
      process.env.JWT_SECRET_KEY
    );

    const user = await User.findById(decoded._id);

    if (!user || user.refreshToken !== incomingRefreshToken) {
      throw new ApiError(401, "Refresh token expired or reused");
    }

    const { accessToken, refreshToken } =
      await generateAccessAndRefreshToken(user._id);

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };

    res
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken },
          "Access token refreshed"
        )
      );
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
