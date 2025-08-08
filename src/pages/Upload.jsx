
import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Upload() {
  const [jobAddress, setJobAddress] = useState("");
  const [reportType, setReportType] = useState("");
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");

  const handleUpload = async () => {
    if (!jobAddress || !reportType || !file) {
      setStatus("Please fill in all fields.");
      return;
    }
    const path = `${jobAddress}/${reportType}/${file.name}`;
    const { error } = await supabase.storage.from("reports").upload(path, file);
    if (error) {
      setStatus("❌ Upload failed: " + error.message);
    } else {
      setStatus("✅ Upload successful!");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
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
        onChange={(e) => setFile(e.target.files[0])}
        className="border p-2 w-full mb-3"
      />
      <button
        onClick={handleUpload}
        className="bg-bbnOrange text-white px-4 py-2 rounded hover:bg-orange-600"
      >
        Upload
      </button>
      {status && <p className="mt-3 text-sm">{status}</p>}
    </div>
  );
}
