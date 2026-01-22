import React, { useState } from "react";

import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";

const VerifyOtp = () => {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email; // register se aaya hua

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        "http://localhost:5000/auth/verify-otp",
        { email, otp },
        { withCredentials: true }
      );

      toast.success("OTP verified successfully");
      navigate("/login");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "OTP verification failed"
      );
    }
  };

  return (
    <div className="otp-container">
      <form className="otp-card" onSubmit={handleVerifyOtp}>
        <h2>Verify OTP</h2>
        <p>Please enter the OTP sent to your email</p>

        <input
          type="text"
          placeholder="Enter 6-digit OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          maxLength={6}
        />

        <button type="submit">Verify OTP</button>
      </form>
    </div>
  );
};

export default VerifyOtp;

