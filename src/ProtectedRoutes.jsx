import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { Context } from "./context";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(Context);

  if (loading) return <div>Checking session...</div>;

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};

const DoctorRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useContext(Context);

  if (loading) return <div>Loading...</div>;

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (user?.role !== "doctor") {
    return <Navigate to="/" />;
  }

  return children;
};

const PatientRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useContext(Context);

  if (loading) return <div>Loading...</div>;

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (user?.role !== "patient") {
    return <Navigate to="/" />;
  }

  return children;
};

const LoginRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useContext(Context);

  if (loading) return <div>Checking session...</div>;

  if (isAuthenticated) {
    // Optional: role-based redirect
    if (user?.role === "doctor") {
      return <Navigate to="/doctor-dashboard" />;
    }
    if (user?.role === "patient") {
      return <Navigate to="/patient-dashboard" />;
    }

    return <Navigate to="/" />;
  }

  return children;
};


export  { ProtectedRoute, DoctorRoute, PatientRoute, LoginRoute };