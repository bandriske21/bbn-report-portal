<<<<<<< HEAD
// src/pages/Upload.jsx
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/AuthContext";

const CATEGORIES = [
  "Clearance Reports",
  "Air Monitoring Reports",
  "Asbestos ID",
  "Asbestos Surveys",
];

export default function Upload() {
  const { user } = useAuth();
  const [jobCode, setJobCode] = useState("");
  const [jobAddress, setJobAddress] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState([]);

  // If not signed in, block with a friendly message
  if (!user) {
    return (
      <div className="bg-white rounded-2xl shadow-card p-6">
        <h1 className="text-2xl font-semibold mb-2">Sign in required</h1>
        <p className="text-subink">
          Please log in with your whitelisted email to upload reports.
        </p>
      </div>
    );
  }

  function handleFileChange(e) {
    setFiles(Array.from(e.target.files || []));
    setStatus([]);
  }

  async function handleUpload() {
    if (!jobCode.trim() || !jobAddress.trim()) {
      alert("Please enter both a job code and a job address.");
      return;
    }
    if (files.length === 0) {
      alert("Please choose at least one PDF file to upload.");
      return;
    }

    setUploading(true);
    const results = [];

    for (const file of files) {
      const safeJob = jobCode.trim();
      const safeAddress = jobAddress.trim();
      const path = `${safeJob} — ${safeAddress}/${category}/${file.name}`;

      const { error } = await supabase.storage
        .from("reports")
        .upload(path, file, { upsert: false });

      results.push({
        name: file.name,
        status: error ? "error" : "done",
        error: error?.message || null,
      });
    }

    setStatus(results);
    setUploading(false);
  }

  return (
    <div className="bg-white rounded-2xl shadow-card p-6">
      <h1 className="text-2xl font-semibold mb-1">Add Reports</h1>
      <p className="text-subink mb-6">
        Upload PDF reports into the selected job and category.
      </p>

      {/* Job Code */}
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

      {/* Job Address */}
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
        className="mb-6 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
      >
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      {/* Files */}
      <label className="block mb-2 text-sm font-medium text-subink">
        Upload PDF files
      </label>
      <input
        type="file"
        accept="application/pdf"
        multiple
        onChange={handleFileChange}
        className="mb-4"
      />

      {/* Upload */}
      <button
        onClick={handleUpload}
        disabled={uploading}
        className="bg-accent text-white px-4 py-2 rounded-lg hover:opacity-90 transition disabled:opacity-50"
      >
        {uploading ? "Uploading…" : "Upload"}
      </button>

      {/* Status list */}
      {status.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Upload status</h2>
          <ul className="space-y-1">
            {status.map((s, i) => (
              <li
                key={`${s.name}-${i}`}
                className={`flex justify-between text-sm ${
                  s.status === "done" ? "text-green-600" : "text-red-600"
                }`}
              >
                <span className="truncate pr-4">{s.name}</span>
                <span>{s.status}{s.error ? ` — ${s.error}` : ""}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
=======
import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/AuthContext";

export default function Upload() {
  const { user, role, loading } = useAuth();
  const [jobAddress, setJobAddress] = useState("");
  const [reportType, setReportType] = useState("");
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async () => {
    if (!user) {
      setStatus("Please sign in to upload.");
      return;
    }
    const canUpload = role === "admin" || role === "uploader";
    if (!canUpload) {
      setStatus("Your account does not have permission to upload.");
      return;
    }
    if (!jobAddress || !reportType || !file) {
      setStatus("Please fill in all fields.");
      return;
    }
    if (file.type !== "application/pdf") {
      setStatus("Only PDF files are allowed.");
      return;
    }
    setIsUploading(true);
    setStatus(""); // Clear previous status
    // Sanitize jobAddress to prevent path issues (replace / with _)
    const sanitizedAddress = jobAddress.replace(/\//g, "_");
    const path = `${sanitizedAddress}/${reportType}/${file.name}`;
    const { error } = await supabase.storage
      .from("reports")
      .upload(path, file, { upsert: true, contentType: "application/pdf" });
    if (error) {
      setStatus("❌ Upload failed: " + error.message);
    } else {
      setStatus("✅ Upload successful!");
      // Clear fields after success
      setJobAddress("");
      setReportType("");
      setFile(null);
    }
    setIsUploading(false);
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      {loading ? (
        <p>Checking permissions…</p>
      ) : !user ? (
        <p>Please sign in to upload reports.</p>
      ) : !(role === "admin" || role === "uploader") ? (
        <p>Your account does not have permission to upload reports.</p>
      ) : null}
      <h2 className="text-xl font-bold mb-4">Upload Report</h2>
      <input
        type="text"
        placeholder="Job Address"
        value={jobAddress}
        onChange={(e) => setJobAddress(e.target.value)}
        className="border p-2 w-full mb-3"
      />
      <select
        value={reportType}
        onChange={(e) => setReportType(e.target.value)}
        className="border p-2 w-full mb-3"
      >
        <option value="">Select Report Type</option>
        <option value="Clearance">Clearance</option>
        <option value="Air Monitoring">Air Monitoring</option>
        <option value="Sample Analysis">Sample Analysis</option>
      </select>
      <input
        type="file"
        accept="application/pdf" // Browser hint for PDFs
        onChange={(e) => setFile(e.target.files[0])}
        className="border p-2 w-full mb-3"
      />
      <button
        onClick={handleUpload}
        disabled={isUploading}
        className="bg-bbnOrange text-white px-4 py-2 rounded hover:bg-orange-600 disabled:opacity-50"
      >
        {isUploading ? "Uploading..." : "Upload"}
      </button>
      {status && <p className="mt-3 text-sm">{status}</p>}
    </div>
  );
}
>>>>>>> c0be2d7 (Initial commit: routing, auth, upload, jobs fixes)
