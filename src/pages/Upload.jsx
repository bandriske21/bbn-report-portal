// src/pages/Upload.jsx
import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/AuthContext";

export default function Upload() {
  const { role } = useAuth();
  const [jobCode, setJobCode] = useState("");
  const [jobAddress, setJobAddress] = useState("");
  const [category, setCategory] = useState("Clearance Reports");
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState([]);

  const categories = [
    "Clearance Reports",
    "Air Monitoring Reports",
    "Asbestos ID",
    "Asbestos Surveys",
  ];

  // Restrict to admin/uploader roles
  if (role !== "admin" && role !== "uploader") {
    return (
      <div className="bg-white rounded-2xl shadow-card p-6">
        <h1 className="text-xl font-semibold mb-2">Access denied</h1>
        <p className="text-subink">
          You do not have permission to upload reports.  
          Please contact BBN administration if you think this is a mistake.
        </p>
      </div>
    );
  }

  async function handleUpload() {
    if (!jobCode.trim() || !jobAddress.trim()) {
      alert("Please enter both a job code and address.");
      return;
    }
    if (files.length === 0) {
      alert("Please select at least one PDF file.");
      return;
    }

    setUploading(true);
    const newStatus = [];

    for (let file of files) {
      const fileName = file.name;
      const path = `${jobCode} — ${jobAddress}/${category}/${fileName}`;

      const { error } = await supabase.storage
        .from("reports")
        .upload(path, file, { upsert: false });

      newStatus.push({ name: fileName, status: error ? "error" : "done" });
    }

    setStatus(newStatus);
    setUploading(false);
  }

  function handleFileChange(e) {
    setFiles(Array.from(e.target.files));
  }

  return (
    <div className="bg-white rounded-2xl shadow-card p-6">
      <h1 className="text-2xl font-semibold mb-4">Add Reports</h1>

      {/* Job code */}
      <label className="block mb-2 text-sm font-medium text-subink">
        Job Code (e.g. BBN.4310)
      </label>
      <input
        type="text"
        value={jobCode}
        onChange={(e) => setJobCode(e.target.value)}
        className="mb-4 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
        placeholder="BBN.XXXX"
      />

      {/* Job address */}
      <label className="block mb-2 text-sm font-medium text-subink">
        Job Address
      </label>
      <input
        type="text"
        value={jobAddress}
        onChange={(e) => setJobAddress(e.target.value)}
        className="mb-4 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
        placeholder="123 Example Street, City, State, Postcode"
      />

      {/* Category */}
      <label className="block mb-2 text-sm font-medium text-subink">
        Category
      </label>
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="mb-4 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
      >
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>

      {/* File input */}
      <label className="block mb-2 text-sm font-medium text-subink">
        Upload PDFs
      </label>
      <input
        type="file"
        accept="application/pdf"
        multiple
        onChange={handleFileChange}
        className="mb-4"
      />

      {/* Upload button */}
      <button
        onClick={handleUpload}
        disabled={uploading}
        className="bg-accent text-white px-4 py-2 rounded-lg hover:opacity-90 transition disabled:opacity-50"
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>

      {/* Upload status */}
      {status.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Upload status</h2>
          <ul className="space-y-1">
            {status.map((s, i) => (
              <li
                key={i}
                className={`flex justify-between text-sm ${
                  s.status === "done" ? "text-green-600" : "text-red-600"
                }`}
              >
                <span>{s.name}</span>
                <span>{s.status}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
