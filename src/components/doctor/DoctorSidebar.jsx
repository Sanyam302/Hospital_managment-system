const DoctorSidebar = ({ setActiveTab }) => {
  return (
    <div style={{
      width: "220px",
      background: "#1e293b",
      color: "white",
      padding: "20px"
    }}>
      <h2>Doctor Panel</h2>

      <button onClick={() => setActiveTab("profile")}>
        Profile
      </button>

      <button onClick={() => setActiveTab("appointments")}>
        Appointments
      </button>

      <button onClick={() => setActiveTab("slots")}>
        Add Slots
      </button>
    </div>
  );
};

export default DoctorSidebar;