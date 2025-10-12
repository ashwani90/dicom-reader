import React, { useEffect, useState } from "react";
import axios from "axios";
import api from '../api';
import DicomModal from './DicomModal';
import UploadModal from '../components/UploadModal';

const Home = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [previewData, setPreviewData] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);

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
        const res = await api.get("files/");
        setFiles(res.data);
      } catch (err) {
        setError("Failed to fetch files. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, []);

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
      <button
          onClick={() => setModalOpen(true)}
          className="text-white px-4 py-2 rounded hover:bg-blue-700" style={{ backgroundColor: "#222222" }}
        >
          Upload File
        </button>
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
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>ID</th>
            <th style={thStyle}>Filename</th>
            <th style={thStyle}>Uploaded At</th>
            <th style={thStyle}>File Type</th>
            <th style={thStyle}>Is Dicom</th>
            <th style={thStyle}>Modality</th>
            <th style={thStyle}>Preview</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file) => (
            <tr key={file.id} style={rowStyle}>
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
             
            </tr>
          ))}
        </tbody>
      </table>
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
    </div>
  );
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
  borderSpacing: "0 0.5rem",
};

const thStyle = {
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

export default Home;
