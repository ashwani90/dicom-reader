import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import FileView from "./FileView";

const CaseList = () => {
  const [cases, setCases] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const res = await api.get("cases/");
        setCases(res.data);
      } catch (error) {
        console.error("Error fetching cases:", error);
      }
    };
    fetchCases();
  }, []);

  return (
    <div style={containerStyle}>
      <h2 style={headingStyle}>All Cases</h2>

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
        <button onClick={() => navigate("/cases/new")} style={addButtonStyle}>
          + New Case
        </button>
      </div>

      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Case Number</th>
            <th style={thStyle}>Title</th>
            <th style={thStyle}>Patient Name</th>
            <th style={thStyle}>Patient Age</th>
            <th style={thStyle}>Patient Sex</th>
            <th style={thStyle}>Created At</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {cases.length > 0 ? (
            cases.map((c) => (
              <tr key={c.id} style={rowStyle}>
                <td style={tdStyle}>{c.case_id}</td>
                <td style={tdStyle}>{c.title}</td>
                <td style={tdStyle}>{c.patient_name || "—"}</td>
                <td style={tdStyle}>{c.patient_age || "—"}</td>
                <td style={tdStyle}>{c.patient_sex || "—"}</td>
                <td style={tdStyle}>{new Date(c.created_at).toLocaleString()}</td>
                <td style={tdStyle}>
                  <button style={viewButtonStyle} onClick={() => navigate(`/cases/${c.id}`)}>
                    View
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} style={{ ...tdStyle, textAlign: "center", fontStyle: "italic" }}>
                No cases available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CaseList;

//
// 🎨 Styles
//
const containerStyle = {
  maxWidth: "900px",
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
  marginBottom: "1rem",
};

const addButtonStyle = {
  backgroundColor: "#222",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  padding: "0.5rem 1rem",
  cursor: "pointer",
  fontSize: "0.9rem",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "separate",
  borderSpacing: "0 0.5rem",
};

const thStyle = {
  textAlign: "left",
  fontWeight: "600",
  color: "#ddd",
  padding: "0.75rem 1rem",
  fontSize: "0.9rem",
  backgroundColor: "#222",
};

const tdStyle = {
  padding: "0.75rem 1rem",
  backgroundColor: "#fafafa",
  borderRadius: "6px",
  fontSize: "0.9rem",
  color: "#333",
};

const rowStyle = {
  backgroundColor: "#fafafa",
};

const viewButtonStyle = {
  padding: "0.4rem 0.8rem",
  fontSize: "0.85rem",
  backgroundColor: "#f0f0f0",
  border: "1px solid #999",
  borderRadius: "6px",
  cursor: "pointer",
};
