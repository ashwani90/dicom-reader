import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendRequest } from "../request";

const Home = () => {
  const [requests, setRequests] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await sendRequest("get", "/api/case-requests/"); // API to fetch incoming requests
        setRequests(res.data);
      } catch (error) {
        console.error("Error fetching requests:", error);
      }
    };
    fetchRequests();
  }, []);

  const handleAccept = async (requestId) => {
    try {
      const payload = { action: "accept" };
      await sendRequest("post", `/api/case-requests/${requestId}/action/`, payload);
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch (error) {
      console.error("Error accepting request:", error);
    }
  };

  const handleReject = async (requestId) => {
    try {
      const payload = { action: "reject" };
      await sendRequest("post", `/api/case-requests/${requestId}/action/`, payload);
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch (error) {
      console.error("Error rejecting request:", error);
    }
  };

  return (
    <div style={containerStyle}>
      <h2 style={headingStyle}>Incoming Case Requests</h2>

      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Request ID</th>
            <th style={thStyle}>Case Number</th>
            <th style={thStyle}>Title</th>
            <th style={thStyle}>Requested By</th>
            <th style={thStyle}>Created At</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.length > 0 ? (
            requests.map((req) => (
              <tr key={req.id} style={rowStyle}>
                <td style={tdStyle}>{req.id}</td>
                <td style={tdStyle}>{req.case_number}</td>
                <td style={tdStyle}>{req.case_title || "—"}</td>
                <td style={tdStyle}>{req.sender_name}</td>
                <td style={tdStyle}>{new Date(req.created_at).toLocaleString()}</td>
                <td style={tdStyle}>
                  <div style={actionBarStyle}>
                    <button
                      style={acceptButtonStyle}
                      onClick={() => handleAccept(req.id)}
                    >
                      Accept
                    </button>
                    <button
                      style={rejectButtonStyle}
                      onClick={() => handleReject(req.id)}
                    >
                      Reject
                    </button>
                    <button
                      style={viewButtonStyle}
                      onClick={() => navigate(`/cases/${req.case_id}`)}
                    >
                      View
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={6}
                style={{ ...tdStyle, textAlign: "center", fontStyle: "italic" }}
              >
                No incoming requests
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Home;

// 🎨 Styles
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

const actionBarStyle = {
  display: "flex",
  gap: "0.5rem",
  flexWrap: "wrap",
};

const acceptButtonStyle = {
  backgroundColor: "#4caf50",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  padding: "0.4rem 0.8rem",
  cursor: "pointer",
  fontSize: "0.85rem",
};

const rejectButtonStyle = {
  backgroundColor: "#f44336",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  padding: "0.4rem 0.8rem",
  cursor: "pointer",
  fontSize: "0.85rem",
};

const viewButtonStyle = {
  padding: "0.4rem 0.8rem",
  fontSize: "0.85rem",
  backgroundColor: "#f0f0f0",
  border: "1px solid #999",
  borderRadius: "6px",
  cursor: "pointer",
};
