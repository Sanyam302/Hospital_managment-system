import express from "express";
import Doctor  from "../models/doctor_model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
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

export default router;
