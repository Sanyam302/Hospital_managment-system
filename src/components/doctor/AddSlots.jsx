import { useState } from "react";
import axios from "axios";

const AddSlots = () => {
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddSlots = async () => {
    if (!date || !startTime || !endTime) {
      setMessage("Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const res = await axios.post(
        "http://localhost:5000/doctor/add-slots",
        {
          date,
          startTime,
          endTime
        },
        {
          withCredentials: true
        }
      );

      setMessage(res.data.message);
      setDate("");
      setStartTime("");
      setEndTime("");

    } catch (error) {
      setMessage(
        error.response?.data?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "500px" }}>
      <h2>Add Slots</h2>

      <div style={{ marginBottom: "15px" }}>
        <label>Date</label><br />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label>Start Time</label><br />
        <input
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label>End Time</label><br />
        <input
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />
      </div>

      <button onClick={handleAddSlots} disabled={loading}>
        {loading ? "Generating..." : "Generate Slots"}
      </button>

      {message && (
        <p style={{ marginTop: "15px", color: "green" }}>
          {message}
        </p>
      )}
    </div>
  );
};

export default AddSlots;