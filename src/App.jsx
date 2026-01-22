import React, { useContext, useEffect } from "react";
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
const App = () => {
  const { isAuthenticated, setIsAuthenticated, setUser } =
    useContext(Context);
  useEffect(() => {
  const checkAuth = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/auth/me",
        { withCredentials: true }
      );

      setIsAuthenticated(true);
      setUser(res.data.data.user);
    } catch {
      setIsAuthenticated(false);
      setUser(null);
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
          <Route path="/login" element={<Login />} />
          <Route path="/verifyOtp" element={<VerifyOtp/>}/>
        </Routes>
        <Footer />
        <ToastContainer position="top-center" />
      </Router>
    </>
  );
};

export default App;