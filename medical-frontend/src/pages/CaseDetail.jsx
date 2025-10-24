import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import FileView from "./FileView";
import { sendRequest } from "../request";

const CaseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);

  useEffect(() => {
    const fetchCase = async () => {
      try {
        const res = await sendRequest('get', `/api/cases/${id}/`);
        setCaseData(res.data);
      } catch (error) {
        console.error("Error fetching case:", error);
      }
    };
    fetchCase();
  }, [id]);

  if (!caseData) return <p style={{ textAlign: "center", marginTop: "2rem" }}>Loading...</p>;

  return (
    <div style={containerStyle}>
      <button onClick={() => navigate("/cases")} style={backButtonStyle}>
        ← Back to Cases
      </button>

      <h2 style={headingStyle}>{caseData.title}</h2>
      <p style={descStyle}>{caseData.description || "No description available."}</p>

      <div style={sectionStyle}>
        <h3 style={sectionHeadingStyle}>Patient Information</h3>
        <div style={infoGridStyle}>
          <p><strong>Name:</strong> {caseData.patient_name || "—"}</p>
          <p><strong>ID:</strong> {caseData.patient_id || "—"}</p>
          <p><strong>Age:</strong> {caseData.patient_age || "—"}</p>
          <p><strong>Sex:</strong> {caseData.patient_sex || "—"}</p>
          <p style={{ gridColumn: "span 2" }}>
            <strong>Diagnosis:</strong> {caseData.diagnosis || "—"}
          </p>
        </div>
      </div>

      <div style={sectionStyle}>
        <h3 style={sectionHeadingStyle}>Linked DICOM Files</h3>
        <FileView case_id={caseData.id} />
        {/* <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Filename</th>
              <th style={thStyle}>Uploaded At</th>
            </tr>
          </thead>
          <tbody>
            {caseData.files.length > 0 ? (
              caseData.files.map((f) => (
                <tr key={f.id} style={rowStyle}>
                  <td style={tdStyle}>{f.filename}</td>
                  <td style={tdStyle}>{new Date(f.uploaded_at).toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={2} style={{ ...tdStyle, textAlign: "center", fontStyle: "italic" }}>
                  No files linked yet
                </td>
              </tr>
            )}
          </tbody>
        </table> */}
      </div>
    </div>
  );
};

export default CaseDetail;

//
// 🎨 Matching minimalist styles
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
  fontSize: "1.6rem",
  fontWeight: "600",
  textAlign: "center",
  color: "#222",
  marginBottom: "0.5rem",
};

const descStyle = {
  fontSize: "0.95rem",
  color: "#555",
  textAlign: "center",
  marginBottom: "1.5rem",
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

const sectionStyle = {
  backgroundColor: "#fafafa",
  borderRadius: "10px",
  padding: "1rem",
  marginBottom: "1.5rem",
  boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
};

const sectionHeadingStyle = {
  fontSize: "1.1rem",
  fontWeight: "600",
  marginBottom: "0.75rem",
  backgroundColor: "#222",
  color: "#fff",
  padding: "0.5rem 1rem",
  borderRadius: "6px",
};

const infoGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "0.75rem 1rem",
  fontSize: "0.9rem",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "separate",
  borderSpacing: "0 0.5rem",
  marginTop: "0.5rem",
};

const thStyle = {
  textAlign: "left",
  fontWeight: "600",
  color: "#ddd",
  padding: "0.75rem 1rem",
  borderBottom: "1px solid #eee",
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
