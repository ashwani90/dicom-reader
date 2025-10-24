import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { sendRequest } from "../request";

const CaseForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    case_id: `CASE-${Date.now()}`,
    title: "",
    description: "",
    patient_name: "",
    patient_id: "",
    patient_age: "",
    patient_sex: "",
    diagnosis: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await sendRequest('post', '/api/cases/', formData);
      navigate("/cases");
    } catch (error) {
      console.error("Error creating case:", error);
    }
  };

  return (
    <div style={containerStyle}>
      <button onClick={() => navigate("/cases")} style={backButtonStyle}>
        ← Back to Cases
      </button>

      <h2 style={headingStyle}>Create New Case</h2>

      <form onSubmit={handleSubmit} style={formStyle}>
        <div style={gridStyle}>
          <div style={inputGroup}>
            <label style={labelStyle}>Case Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              style={inputStyle}
              required
            />
          </div>

          <div style={inputGroup}>
            <label style={labelStyle}>Patient Name</label>
            <input
              type="text"
              name="patient_name"
              value={formData.patient_name}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          <div style={inputGroup}>
            <label style={labelStyle}>Patient ID</label>
            <input
              type="text"
              name="patient_id"
              value={formData.patient_id}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          <div style={inputGroup}>
            <label style={labelStyle}>Age</label>
            <input
              type="number"
              name="patient_age"
              value={formData.patient_age}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          <div style={inputGroup}>
            <label style={labelStyle}>Sex</label>
            <select
              name="patient_sex"
              value={formData.patient_sex}
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="">Select</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
              <option value="O">Other</option>
            </select>
          </div>
        </div>

        <div style={inputGroup}>
          <label style={labelStyle}>Diagnosis</label>
          <input
            type="text"
            name="diagnosis"
            value={formData.diagnosis}
            onChange={handleChange}
            style={inputStyle}
          />
        </div>

        <div style={inputGroup}>
          <label style={labelStyle}>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            style={textareaStyle}
            rows="4"
          />
        </div>

        <button type="submit" style={submitButtonStyle}>
          Create Case
        </button>
      </form>
    </div>
  );
};

export default CaseForm;

//
// 🎨 Styles
//
const containerStyle = {
  maxWidth: "700px",
  margin: "2rem auto",
  padding: "1.5rem",
  backgroundColor: "#fff",
  borderRadius: "12px",
  boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
  fontFamily: "system-ui, sans-serif",
  color: "#222",
};

const headingStyle = {
  fontSize: "1.5rem",
  fontWeight: "600",
  textAlign: "center",
  color: "#222",
  marginBottom: "1.5rem",
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "1rem",
};

const inputGroup = { display: "flex", flexDirection: "column" };
const labelStyle = { fontSize: "0.85rem", marginBottom: "0.4rem", color: "#444" };

const inputStyle = {
  padding: "0.6rem",
  borderRadius: "6px",
  border: "1px solid #ccc",
  fontSize: "0.9rem",
};

const textareaStyle = {
  padding: "0.6rem",
  borderRadius: "6px",
  border: "1px solid #ccc",
  fontSize: "0.9rem",
};

const submitButtonStyle = {
  backgroundColor: "#222",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  padding: "0.75rem",
  fontSize: "0.95rem",
  cursor: "pointer",
  marginTop: "1rem",
};

const backButtonStyle = {
  backgroundColor: "#f5f5f5",
  border: "1px solid #ddd",
  borderRadius: "6px",
  padding: "0.4rem 0.8rem",
  fontSize: "0.85rem",
  cursor: "pointer",
  marginBottom: "1rem",
};
