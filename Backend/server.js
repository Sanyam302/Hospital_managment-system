import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import connectDB from "./db/db.js";
import doctorRoutes from "./routes/doctor.routes.js"

dotenv.config();

const app = express();

// middlewares]
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// routes
app.use("/auth", authRoutes);
app.use("/doctor",doctorRoutes);

// test route
app.post("/test", (req, res) => {
  console.log("Body:", req.body);
  res.json({ body: req.body });
});

// database connection
connectDB();

// server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
