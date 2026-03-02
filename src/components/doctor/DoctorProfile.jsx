import { useEffect, useState } from "react";
import axios from "axios";

const DoctorProfile = () => {
  const [doctor, setDoctor] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/doctor/profile",
        { withCredentials: true }
      );
      setDoctor(res.data.data);
    } catch (error) {
      console.error("Error fetching profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setDoctor({
      ...doctor,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    try {
      await axios.put(
        "http://localhost:5000/doctor/profile",
        doctor,
        { withCredentials: true }
      );
      alert("Profile updated successfully");
      setEditMode(false);
      fetchProfile();
    } catch (error) {
      alert("Update failed");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!doctor) return <p>No profile found</p>;

  return (
    <div style={styles.container}>
      <h2>Doctor Profile</h2>

      {/* Profile Avatar */}
      <div style={styles.avatarContainer}>
        <div style={styles.avatar}>
          👤
        </div>
      </div>

      {/* Profile Fields */}
      <div style={styles.field}>
        <label>Name</label>
        <input
          name="name"
          value={doctor.name || ""}
          disabled
        />
      </div>

      <div style={styles.field}>
        <label>Email</label>
        <input
          name="email"
          value={doctor.email || ""}
          disabled
        />
      </div>
      <div style={styles.field}>
  <label>Hospital Name</label>
  <input
    name="hospitalName"
    value={doctor.hospitalName || ""}
    onChange={handleChange}
    disabled={!editMode}
  />
</div>
<div style={styles.field}>
  <label>Qualification</label>
  <input
    name="qualification"
    value={doctor.qualification || ""}
    onChange={handleChange}
    disabled={!editMode}
  />
</div>
      <div style={styles.field}>
        <label>Specialization</label>
        <input
          name="specialization"
          value={doctor.specialization || ""}
          onChange={handleChange}
          disabled={!editMode}
        />
      </div>

      <div style={styles.field}>
        <label>Experience (years)</label>
        <input
          name="experience"
          type="number"
          value={doctor.experience || ""}
          onChange={handleChange}
          disabled={!editMode}
        />
      </div>

      <div style={styles.field}>
        <label>Consultation Fee</label>
        <input
          name="fee"
          type="number"
          value={doctor.fee || ""}
          onChange={handleChange}
          disabled={!editMode}
        />
      </div>

      <div style={styles.field}>
        <label>City</label>
        <input
          name="city"
          value={doctor.city || ""}
          onChange={handleChange}
          disabled={!editMode}
        />
      </div>

      <div style={styles.field}>
        <label>License Number</label>
        <input
          name="licenseNumber"
          value={doctor.licenseNumber || ""}
          onChange={handleChange}
          disabled={!editMode}
        />
      </div>
     <div style={styles.field}>
  <label>About</label>
  <textarea
    name="about"
    value={doctor.about || ""}
    onChange={handleChange}
    disabled={!editMode}
    rows="4"
  />
</div>
      {/* Buttons */}
      {!editMode ? (
        <button onClick={() => setEditMode(true)} style={styles.button}>
          Edit Profile
        </button>
      ) : (
        <>
          <button onClick={handleSave} style={styles.button}>
            Save Changes
          </button>
          <button
            onClick={() => setEditMode(false)}
            style={styles.cancelButton}
          >
            Cancel
          </button>
        </>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "600px",
    margin: "auto",
    padding: "20px"
  },
  avatarContainer: {
    textAlign: "center",
    marginBottom: "20px"
  },
  avatar: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    background: "#e2e8f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "50px"
  },
  field: {
    marginBottom: "15px",
    display: "flex",
    flexDirection: "column"
  },
  button: {
    padding: "10px 15px",
    marginRight: "10px",
    cursor: "pointer"
  },
  cancelButton: {
    padding: "10px 15px",
    background: "#ddd",
    cursor: "pointer"
  }
};

export default DoctorProfile;