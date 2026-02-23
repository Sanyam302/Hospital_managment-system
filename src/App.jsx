import React, { useContext, useEffect, useState } from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import Appointment from "./Pages/Appointment";
import AboutUs from "./Pages/AboutUs";
import Register from "./Pages/Register";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { Context } from "./context";
import Login from "./Pages/Login";
import VerifyOtp from "./Pages/VerifyOtp"
import api from "./axios"
import FindDoctors from "./Pages/FindDoctors";
import CompleteProfile from "./Pages/CompleteProfile"
import AddSlot from "./Pages/AddSlot"
import {ProtectedRoute} from "./ProtectedRoutes";
import  {DoctorRoute}  from "./ProtectedRoutes";
import {PatientRoute}  from "./ProtectedRoutes";
import DoctorDashboard from "./Pages/DoctorDashboard";
import PatientDashboard from "./Pages/PatientDashboard";
import { LoginRoute } from "./ProtectedRoutes";


const App = () => {
  const { isAuthenticated, setIsAuthenticated, setUser } =
    useContext(Context);
    const [loading, setLoading] = useState(true);
useEffect(() => {
  const checkAuth = async () => {
    try {
      const res = await api.get("/auth/me");
      setIsAuthenticated(true);
      setUser(res.data.data.user);
    } catch {
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  checkAuth();
}, []);
 
  return (
    <>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/appointment" element={<Appointment />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<LoginRoute><Login /></LoginRoute>} />
          <Route path="/verifyOtp" element={<VerifyOtp/>}/>
          <Route path="/doctors" element={<FindDoctors />} />
          <Route path="/complete-profile" element={<ProtectedRoute><DoctorRoute><CompleteProfile /></DoctorRoute></ProtectedRoute>} />
          <Route path="/add-slot" element={<ProtectedRoute><DoctorRoute><AddSlot /></DoctorRoute></ProtectedRoute>} />
          <Route path="/doctor-dashboard" element={<ProtectedRoute><DoctorRoute><DoctorDashboard /></DoctorRoute></ProtectedRoute >} />
          <Route path="/patient-dashboard" element={<ProtectedRoute><PatientRoute><PatientDashboard /></PatientRoute></ProtectedRoute>} />
        </Routes>
        <Footer />
        <ToastContainer position="top-center" />
      </Router>
    </>
  );
};

export default App;