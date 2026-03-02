  import { useState } from "react";
import DoctorSidebar from "../components/doctor/DoctorSidebar";
import DoctorProfile from "../components/doctor/DoctorProfile";
import DoctorAppointments from "../components/doctor/DoctorAppointments";
import AddSlots from "../components/doctor/AddSlots";

const DoctorDashboard = () => {
  const [activeTab, setActiveTab] = useState("profile");

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return <DoctorProfile />;
      case "appointments":
        return <DoctorAppointments />;
      case "slots":
        return <AddSlots />;
      default:
        return <DoctorProfile />;
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <DoctorSidebar setActiveTab={setActiveTab} />
      <div style={{ flex: 1, padding: "20px" }}>
        {renderContent()}
      </div>
    </div>
  );
};

export default DoctorDashboard;
