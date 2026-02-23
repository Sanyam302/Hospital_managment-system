import { useState } from "react"
import axios from "axios"

const AddSlot = () => {

  const [slotData, setSlotData] = useState({
    date: "",
    startTime: "",
    endTime: ""
  })

  const handleChange = (e) => {
    setSlotData({
      ...slotData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const token = localStorage.getItem("accessToken")

      await axios.post(
        "http://localhost:5000/doctor/add-slot",
        slotData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      alert("Slot Added Successfully")

    } catch (err) {
      alert(err.response?.data?.message || "Error")
    }
  }

  return (
    <div>
      <h2>Add Availability Slot</h2>
      <form onSubmit={handleSubmit}>
        <input type="date" name="date" onChange={handleChange} />
        <input type="time" name="startTime" onChange={handleChange} />
        <input type="time" name="endTime" onChange={handleChange} />
        <button type="submit">Add Slot</button>
      </form>
    </div>
  )
}

export default AddSlot;
