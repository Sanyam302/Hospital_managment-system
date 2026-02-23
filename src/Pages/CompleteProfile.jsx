import { useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

const CompleteProfile = () => {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    specialization: "",
    experience: "",
    hospitalName: "",
    consultationFee: "",
    bio: ""
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const token = localStorage.getItem("accessToken")

      await axios.post(
        "http://localhost:5000/doctor/complete-profile",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          withCredentials: true
        }
      )

      alert("Profile Completed Successfully")
      navigate("/ ")

    } catch (err) {
      alert(err.response?.data?.message || "Error")
    }
  }

  return (
    <div className="complete-profile-wrapper">
  <div className="complete-profile-card">
    <h2>Complete Doctor Profile</h2>

    <form onSubmit={handleSubmit}>
      <input
        name="specialization"
        placeholder="Specialization"
        onChange={handleChange}
      />

      <input
        name="experience"
        type="number"
        placeholder="Experience (years)"
        onChange={handleChange}
      />

      <input
        name="hospitalName"
        placeholder="Hospital Name"
        onChange={handleChange}
      />

      <input
        name="consultationFee"
        type="number"
        placeholder="Consultation Fee"
        onChange={handleChange}
      />

      <textarea
        name="bio"
        placeholder="Short Bio"
        onChange={handleChange}
      />

      <button type="submit">Submit</button>
    </form>
  </div>
</div>
  )
}

export default CompleteProfile;
