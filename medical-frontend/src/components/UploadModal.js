import React, { useState } from "react";

const fileTypes = ["Lungs CT", "Brain MRI", "Chest X-Ray"]; // predefined list

export default function UploadModal({ isOpen, onClose, onUploadSuccess }) {
  const [caseId, setCaseId] = useState("");
  const [fileType, setFileType] = useState(fileTypes[0]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!caseId || !file || !fileType) {
      alert("Please fill all fields and select a file");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("case_id", caseId);
      formData.append("filetype", fileType);
      formData.append("uploaded_file", file); // match Django backend

      const response = await fetch("http://localhost:8000/upload/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const data = await response.json();
      console.log("Upload successful:", data);

      if (onUploadSuccess) onUploadSuccess(data.file);

      // Reset form
      setCaseId("");
      setFileType(fileTypes[0]);
      setFile(null);
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to upload file. See console for details.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
  <div
    className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50"
    onClick={onClose}
  >
    <div
      className="bg-white rounded-lg shadow-md w-[480px] max-w-[90%] p-6 flex flex-col gap-5"
      onClick={(e) => e.stopPropagation()}
    >
      <h3 className="text-xl font-semibold text-gray-800 mb-2 text-center">
        Upload DICOM File
      </h3>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {/* Case ID */}
        <input
          type="text"
          placeholder="Case ID"
          value={caseId}
          onChange={(e) => setCaseId(e.target.value)}
          className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-500"
          required
        />

        {/* File Type */}
        <select
          value={fileType}
          onChange={(e) => setFileType(e.target.value)}
          className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-700"
        >
          {fileTypes.map((type, idx) => (
            <option key={idx} value={type}>
              {type}
            </option>
          ))}
        </select>

        {/* File Input */}
        <input
          type="file"
          accept=".dcm,.dicom"
          onChange={(e) => setFile(e.target.files[0])}
          className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          required
        />

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            style={{ backgroundColor: "#222222" }}
            className="px-4 py-2 rounded-md text-white hover:opacity-90 transition"
            disabled={loading}
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </form>
    </div>
  </div>
);


}
