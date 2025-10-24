import React, { useEffect, useState } from "react";
import axios from "axios";
import api from '../api';
import DicomModal from './DicomModal';
import UploadModal from '../components/UploadModal';
import { sendRequest } from "../request";

const FileView = ({case_id}) => {
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [previewData, setPreviewData] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isSendModalOpen, setSendModalOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [message, setMessage] = useState("");

//   const handleFileUpload = async (event) => {
//   const uploadedFile = event.target.files[0];
//   if (!uploadedFile) return;

//   try {
//     console.log("Uploading file:", uploadedFile.name);

//     // Prepare form data
//     const formData = new FormData();
//     formData.append("uploaded_file", uploadedFile); // 'file' must match Django view field name
//     formData.append('case_id', '1'); // Example case_id, adjust as needed
//     formData.append('filetype', 'Lungs CT'); 

//     // Send POST request to backend
//     const response = await fetch("http://localhost:8000/upload/", {
//       method: "POST",
//       body: formData,
//     });

//     if (!response.ok) {
//       throw new Error(`Upload failed with status ${response.status}`);
//     }

//     const data = await response.json();
//     console.log("Upload successful:", data);

//     // Update local file list
    
//     setFiles((prev) => [...prev, data.file]);
//   } catch (error) {
//     console.error("Error uploading file:", error);
//     alert("Failed to upload file. See console for details.");
//   }
// };

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await sendRequest('get', '/api/files/?case='+case_id);
        setFiles(res.data);
      } catch (err) {
        setError("Failed to fetch files. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, []);

  const toggleSelectFile = (id) => {
    setSelectedFiles((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const handleSendFiles = async () => {
    if (!selectedUser) return alert("Select a user first.");
    try {
      const payload = {
        receiver_id: selectedUser,
        file_ids: selectedFiles,
        case_id: case_id,
        message: message,
      };
      await sendRequest('post', '/api/files/send/', payload);
      alert("✅ Files sent successfully!");
      setSendModalOpen(false);
      setSelectedFiles([]);
    } catch (err) {
      alert("❌ Failed to send files." + err.response.data.error);
    }
  };

  const openSendModal = async () => {
    if (selectedFiles.length === 0) return alert("Select at least one file.");
    const res = await sendRequest('get', '/api/auth/users/');
    setUsers(res.data);
    setSendModalOpen(true);
  };

  const handlePreview = async (id) => {
    try {
      setPreviewData({url: `http://localhost:8000/serve-file/`+id});
    } catch (err) {
      setPreviewData({ preview: "Error fetching file preview." });
    }
  };

  const closeModal = () => setPreviewData(null);


  if (loading) return <p>Loading files...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={containerStyle}>
      <h2 style={headingStyle}>Uploaded Files</h2>
      <div style={actionBarStyle}>
      <button
          onClick={() => setModalOpen(true)}
          style={actionButtonStyle}
        >
          Upload File
        </button>
        <button
          onClick={openSendModal}
          style={actionButtonStyle}
          disabled={selectedFiles.length === 0}
        >
          Send Files
        </button>
        </div>
        <UploadModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onUploadSuccess={(filename) => setFiles((prev) => [...prev, filename])}
        setFiles={setFiles}
      />
      {/* <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          Upload File
          <input
            type="file"
            accept=".dcm,.dicom"
            className="hidden"
            onChange={handleFileUpload}
          />
        </label> */}
      <div style={tableContainerStyle}>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}></th>
            <th style={thStyle}>ID</th>
            <th style={thStyle}>Filename</th>
            <th style={thStyle}>Uploaded At</th>
            <th style={thStyle}>File Type</th>
            <th style={thStyle}>Is Dicom</th>
            <th style={thStyle}>Modality</th>
            <th style={thStyle}>Preview</th>
            <th style={thStyle}>Download</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file) => (
            <tr key={file.id} style={rowStyle}>
                <td style={tdStyle}>
                  <input
                    type="checkbox"
                    checked={selectedFiles.includes(file.id)}
                    onChange={() => toggleSelectFile(file.id)}
                  />
                </td>
              <td style={tdStyle}>{file.id}</td>
              <td style={tdStyle}>{file.filename}</td>
              <td style={tdStyle}>
                {new Date(file.uploaded_at).toLocaleString()}
              </td>
              <td style={tdStyle}>{file.filetype}</td>
              <td style={tdStyle}>{file.is_dicom ? "Yes" : "No"}</td>
              <td style={tdStyle}>{file.modality || "N/A"}</td>
              <td style={tdStyle}><button style={buttonStyle} onClick={() => handlePreview(file.id)}>
                  Preview
                </button></td>
              <td style={tdStyle}>
                <a
                    href={`http://localhost:8000/serve-file/`+file.id}
                    download={file.filename} 
                    style={downloadLinkStyle}
                >
                    Download
                </a>
                </td>
              <td style={tdStyle}>{file.modality || "N/A"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      {previewData && (
        <div style={modalOverlayStyle} onClick={closeModal}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <h3 style={modalHeadingStyle}>File Preview</h3>
            <div
              id="dicomViewer"
              style={{ width: '512px', height: '512px', backgroundColor: 'black', margin: '0 auto' }}
            ></div>
            <DicomModal previewData={previewData} />
            <button style={closeButtonStyle} onClick={closeModal}>
              Close
            </button>
          </div>
        </div>
      )}

      {isSendModalOpen && (
        <div style={modalOverlayStyle} onClick={() => setSendModalOpen(false)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <h3 style={modalHeadingStyle}>Send Files</h3>
            <p style={{ fontSize: "0.9rem", color: "#555" }}>
              {selectedFiles.length} file(s) selected
            </p>
            <div style={controlContainerStyle}>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              style={selectStyleSimple}
            >
              <option value="">Select user</option>
              {users.map((user) => (
                <option style={selectStyleSimple} key={user.id} value={user.id}>
                  {user.username}
                </option>
              ))}
            </select>
            
            </div>
            <div style={messageContainerStyle}>
          <label style={labelStyle}>Message (optional):</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Add a short message for the receiver..."
            style={messageBoxStyle}
          />
        </div>
            <button style={actionButtonStyle} onClick={handleSendFiles}>
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const controlContainerStyle = {
  display: "flex",
  flexDirection: "column", // stack items vertically
  alignItems: "stretch",
  gap: "0.75rem", // space between select & button
  width: "100%", // full width of parent
  marginBottom: "1.25rem",
};

const selectStyleSimple = {
  border: "1px solid #ccc",
  borderRadius: "8px",
  padding: "0.5rem 1rem",
  backgroundColor: "#fff",
  color: "#333",
  fontSize: "0.9rem",
  outline: "none",
  appearance: "none", // removes default arrow for consistency
  backgroundImage:
    "linear-gradient(45deg, transparent 50%, #333 50%), linear-gradient(135deg, #333 50%, transparent 50%)",
  backgroundPosition: "calc(100% - 15px) calc(50% - 3px), calc(100% - 10px) calc(50% - 3px)",
  backgroundSize: "5px 5px, 5px 5px",
  backgroundRepeat: "no-repeat",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

const actionBarStyle = {
  display: "flex",
  justifyContent: "flex-end",
  alignItems: "center",
  gap: "0.75rem", // space between buttons
  flexWrap: "wrap", // wrap buttons if screen is narrow
  marginBottom: "1.25rem",
};

const actionButtonStyle = {
  padding: "0.5rem 1rem",
  backgroundColor: "#222",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "0.9rem",
};

const tableContainerStyle = {
  maxHeight: "400px",         // fixed height
  overflowY: "auto",          // vertical scroll when overflowing
  overflowX: "auto",        // prevent horizontal scroll
  borderRadius: "8px",
  border: "1px solid #ddd",
  marginTop: "1rem",
  boxShadow: "inset 0 1px 2px rgba(0,0,0,0.05)",
};

// 🎨 Minimalist styling
const containerStyle = {
  maxWidth: "900px",
  margin: "2rem auto",
  padding: "1rem",
  backgroundColor: "#fff",
  borderRadius: "12px",
  boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
  fontFamily: "system-ui, sans-serif",
  color: "#222",
};

const headingStyle = {
  fontSize: "1.5rem",
  fontWeight: "600",
  marginBottom: "1rem",
  textAlign: "center",
  color: "#222",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "separate",
  borderSpacing: "0 0",
};

const thStyle = {
  position: "sticky",         // keeps header visible while scrolling
  top: 0,
  textAlign: "left",
  fontWeight: "600",
  color: "#ddd",
  padding: "0.75rem 1rem",
  borderBottom: "1px solid #eee",
  fontSize: "0.9rem",
  backgroundColor: "#222"
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

const buttonStyle = {
  padding: "0.4rem 0.8rem",
  fontSize: "0.85rem",
  backgroundColor: "#f0f0f0",
  border: "1px solid #999",
  borderRadius: "6px",
  cursor: "pointer",
};

const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0,0,0,0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const modalStyle = {
  backgroundColor: "#fff",
  borderRadius: "12px",
  padding: "1.5rem",
  maxWidth: "600px",
  width: "90%",
  boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
};

const modalHeadingStyle = {
  marginTop: 0,
  marginBottom: "1rem",
  fontSize: "1.2rem",
  fontWeight: "600",
};

const modalContentStyle = {
  backgroundColor: "#fafafa",
  padding: "1rem",
  borderRadius: "8px",
  maxHeight: "300px",
  overflowY: "auto",
  fontSize: "0.85rem",
  whiteSpace: "pre-wrap",
};

const closeButtonStyle = {
  marginTop: "1rem",
  padding: "0.5rem 1rem",
  fontSize: "0.9rem",
  backgroundColor: "#f5f5f5",
  border: "1px solid #999",
  borderRadius: "8px",
  cursor: "pointer",
};

const downloadLinkStyle = {
  display: "inline-block",
  padding: "0.4rem 0.8rem",
  backgroundColor: "#222222",
  color: "#fff",
  borderRadius: "6px",
  textDecoration: "none",
  fontSize: "0.85rem",
  cursor: "pointer",
};

const selectStyle = {
  width: "100%",
  padding: "0.5rem",
  marginBottom: "1rem",
  borderRadius: "8px",
  border: "1px solid #ccc",
  fontSize: "0.9rem",
};

const messageContainerStyle = {
  marginBottom: "1.5rem",
};

const labelStyle = {
  display: "block",
  fontSize: "0.9rem",
  color: "#333",
  marginBottom: "0.3rem",
};

const messageBoxStyle = {
  width: "100%",
  height: "80px",
  padding: "0.6rem",
  border: "1px solid #ccc",
  borderRadius: "6px",
  resize: "none",
  fontSize: "0.9rem",
  fontFamily: "inherit",
  outline: "none",
};

export default FileView;

