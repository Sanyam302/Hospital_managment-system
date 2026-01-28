import React, { useEffect, useState } from "react";
import axios from "axios";

const FindDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [city, setCity] = useState("");
  const [specialization, setSpecialization] = useState("");
const [allCities, setAllCities] = useState([]);
const [allSpecializations, setAllSpecializations] = useState([]);
const [citySuggestions, setCitySuggestions] = useState([]);
const [specSuggestions, setSpecSuggestions] = useState([]);

  const fetchDoctors = async () => {
    try {
      const res = await axios.get("http://localhost:5000/doctor", {
        params: {
          city,
          specialization,
        },
      });
      setDoctors(res.data.data);
      const cities = [...new Set(res.data.data.map(d => d.city))];
  const specs = [...new Set(res.data.data.map(d => d.specialization))];

  setAllCities(cities);
  setAllSpecializations(specs);
    } catch (error) {
      console.error("Error fetching doctors");
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);
  const searchDoctors= async ()=>{
    try{
       const res = await axios.get("http://localhost:5000/doctor/search", {
        params: {
          city,
          specialization,
        },
      });
      setDoctors(res.data.data);
    }
    catch (error) {
      console.error("Error fetching doctors");
  }
}
  return (
    <div style={{margin:"50px"}} className="container">
      <h2>Find Doctors</h2>

      {/* Search Section */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "30px" ,margin: "40px",cursor: "pointer"}}>
        <div className="input-wrappper">
       <input
  type="text"
  placeholder="City"
  value={city}
  onChange={(e) => {
    const value = e.target.value;
    setCity(value);

    setCitySuggestions(
      allCities.filter(c =>
        c.toLowerCase().includes(value.toLowerCase())
      )
    );
  }}
/>

{citySuggestions.length > 0 && (
  <ul className="suggestions city">
    {citySuggestions.map((c, i) => (
      <li key={i} onClick={() => {
        setCity(c);
        setCitySuggestions([]);
      }}>
        {c}
      </li>
    ))}
  </ul>
)}
</div>
   <div className="input-wrapper">
       <input
  type="text"
  placeholder="Specialization"
  value={specialization}
  onChange={(e) => {
    const value = e.target.value;
    setSpecialization(value);

    setSpecSuggestions(
      allSpecializations.filter(s =>
        s.toLowerCase().includes(value.toLowerCase())
      )
    );
  }}
/>

{specSuggestions.length > 0 && (
  <ul className="suggestions">
    {specSuggestions.map((s, i) => (
      <li key={i} onClick={() => {
        setSpecialization(s);
        setSpecSuggestions([]);
      }}>
        {s}
      </li>
    ))}
  </ul>
)}
</div>

        <button onClick={searchDoctors}>Search</button>
      </div>

      {/* Doctor List */}
      <div>
        {doctors.length === 0 ? (
          <p>No doctors found</p>
        ) : (
          doctors.map((doc) => (
            <div
              key={doc._id}
              style={{
                border: "1px solid #ddd",
                padding: "15px",
                marginBottom: "15px",
                borderRadius: "8px",
              }}
            >
              <h4>{doc.name}</h4>
              <p>Specialization: {doc.specialization}</p>
              <p>Hospital: {doc.hospitalName}</p>
              <p>City: {doc.city}</p>
              <p>Experience: {doc.experience} years</p>
              <p>Fee: ₹{doc.fee}</p>

              <button>Book Appointment</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FindDoctors;
