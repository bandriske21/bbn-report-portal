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
  const { role, loading } = useAuth();
  const [jobCode, setJobCode] = useState("");
  const [jobAddress, setJobAddress] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState([]);

  // Prefill from query params: ?job=BBN.4342 — 55 Eden Ave&category=Air Monitoring Reports
  const searchParams = useMemo(() => new URLSearchParams(window.location.hash.split("?")[1] || ""), []);
  useEffect(() => {
    const qpJob = searchParams.get("job") || "";
    const qpCategory = searchParams.get("category") || "";

    if (qpJob) {
      // Accept either "BBN.4342 — Address" or just "BBN.4342"
      const parts = qpJob.split("—");
      setJobCode(parts[0].trim());
      if (parts[1]) setJobAddress(parts.slice(1).join("—").trim());
    }
    if (qpCategory && CATEGORIES.includes(qpCategory)) {
      setCategory(qpCategory);
    }
  }, [searchParams]);

  // While auth/profile is loading, show a gentle placeholder
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-card p-6">
        <h1 className="text-2xl font-semibold mb-2">Add Reports</h1>
        <p className="text-subink">Checking permissions…</p>
      </div>
    );
  }

  // Role-gated access
  if (role !== "admin" && role !== "uploader") {
    return (
      <div className="bg-white rounded-2xl shadow-card p-6">
        <h1 className="text-xl font-semibold mb-2">Access denied</h1>
        <p className="text-subink">
          You do not have permission to upload reports. Please contact BBN
          administration if you believe this is an error.
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
      const safeAddress = jobAddress.trim();
      const baseFolder = `${jobCode.trim()} — ${safeAddress}`;
      const path = `${baseFolder}/${category}/${file.name}`;

      const { error } = await supabase.storage
        .from("reports")
        .upload(path, file, { upsert: false });

      results.push({ name: file.name, status: error ? "error" : "done", error });
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

      {/* Upload button */}
      <button
        onClick={handleUpload}
        disabled={uploading}
        className="bg-accent text-white px-4 py-2 rounded-lg hover:opacity-90 transition disabled:opacity-50"
      >
        {uploading ? "Uploading…" : "Upload"}
      </button>

      {/* Status */}
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
                <span>
                  {s.status}
                  {s.error?.message ? ` – ${s.error.message}` : ""}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
