// src/pages/Upload.jsx
import { useState, useRef, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { saveAddress } from "../lib/addressMap";

const CATEGORIES = [
  "Clearance Reports",
  "Air Monitoring Reports",
  "Asbestos ID",
  "Asbestos Surveys",
];

// Read prefill values from the URL hash (works with HashRouter: /#/?job=BBN.1234&category=...)
function getPrefill() {
  const hash = window.location.hash || "";
  const qs = hash.includes("?") ? hash.split("?")[1] : "";
  const p = new URLSearchParams(qs);
  return {
    job: p.get("job") || "",
    category: p.get("category") || "",
  };
}

export default function Upload() {
  const pre = getPrefill();

  const [jobCode, setJobCode] = useState(pre.job);         // e.g. BBN.4342
  const [jobAddress, setJobAddress] = useState("");        // display address
  const [category, setCategory] = useState(pre.category);  // one of CATEGORIES
  const [files, setFiles] = useState([]);                  // File[]
  const [progress, setProgress] = useState({});            // { filename: "uploading" | "done" | "error: ..." }
  const [summary, setSummary] = useState("");              // summary text
  const [busy, setBusy] = useState(false);
  const dropRef = useRef(null);

  // If hash changes while on the page (user navigates), re-prefill
  useEffect(() => {
    const onHash = () => {
      const { job, category } = getPrefill();
      if (job) setJobCode(job);
      if (category) setCategory(category);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  function onChoose(e) {
    setFiles(Array.from(e.target.files || []));
    setSummary("");
    setProgress({});
  }

  function onDrop(e) {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files || []);
    setFiles(dropped);
    setSummary("");
    setProgress({});
  }

  function onDragOver(e) {
    e.preventDefault();
  }

  function validateJob(code) {
    return /^BBN\.\d+$/.test(code.trim());
  }

  async function handleUpload() {
    const code = jobCode.trim();
    const addr = jobAddress.trim();

    if (!validateJob(code)) {
      setSummary("Please enter a valid Job Code like: BBN.4342");
      return;
    }
    if (!category) {
      setSummary("Please choose a category.");
      return;
    }
    if (files.length === 0) {
      setSummary("Please select at least one PDF.");
      return;
    }

    setBusy(true);
    let ok = 0, bad = 0;

    // Upload files one by one to: reports/<JobCode>/<Category>/<filename>
    for (const file of files) {
      setProgress((p) => ({ ...p, [file.name]: "uploading" }));

      const path = `${code}/${category}/${file.name}`;
      const { error } = await supabase.storage
        .from("reports")
        .upload(path, file, { upsert: true });

      if (error) {
        bad++;
        setProgress((p) => ({ ...p, [file.name]: `error: ${error.message}` }));
      } else {
        ok++;
        setProgress((p) => ({ ...p, [file.name]: "done" }));
      }
    }

    // Save/refresh the job address map (non-fatal if it fails)
    try {
      if (addr) await saveAddress(code, addr);
    } catch (e) {
      console.warn("Address map save failed (non-fatal):", e);
    }

    setSummary(`Upload finished: ${ok} succeeded, ${bad} failed.`);
    setBusy(false);
  }

  return (
    <div className="bg-card rounded-2xl shadow-card p-6 hover:shadow-cardHover transition max-w-3xl mx-auto">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-ink">Add Reports</h2>
      </div>
      <p className="text-subink text-sm mb-6">
        Upload one or many PDFs. Files are stored under the selected Job Code and Category.
      </p>

      {/* Job Code */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1 text-ink">Job Code (e.g. BBN.4342)</label>
        <input
          className="border border-gray-200 rounded-lg px-3 py-2 w-full bg-white focus:outline-none focus:ring-2 focus:ring-accent"
          placeholder="BBN.4342"
          value={jobCode}
          onChange={(e) => setJobCode(e.target.value)}
        />
        <p className="text-xs text-subink mt-1">Use the exact format: BBN.####</p>
      </div>

      {/* Job Address */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1 text-ink">Job Address</label>
        <input
          className="border border-gray-200 rounded-lg px-3 py-2 w-full bg-white focus:outline-none focus:ring-2 focus:ring-accent"
          placeholder="55 Eden Ave, Coolangatta QLD 4225"
          value={jobAddress}
          onChange={(e) => setJobAddress(e.target.value)}
        />
        <p className="text-xs text-subink mt-1">
          This will show as “BBN.#### — Address” on Jobs & Reports.
        </p>
      </div>

      {/* Category */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1 text-ink">Category</label>
        <select
          className="border border-gray-200 rounded-lg px-3 py-2 w-full bg-white focus:outline-none focus:ring-2 focus:ring-accent"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Select category…</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Drag & Drop / Multi-file chooser */}
      <div
        ref={dropRef}
        onDrop={onDrop}
        onDragOver={onDragOver}
        className="border-2 border-dashed rounded-xl p-6 text-center bg-white mb-4"
      >
        <p className="mb-2 text-ink">Drag & drop PDFs here, or</p>
        <label className="inline-block cursor-pointer bg-accent text-white px-4 py-2 rounded-lg hover:opacity-90 transition">
          Choose files
          <input type="file" accept="application/pdf" multiple className="hidden" onChange={onChoose} />
        </label>
        {files.length > 0 && (
          <p className="text-sm text-subink mt-2">{files.length} file(s) selected</p>
        )}
      </div>

      <button
        onClick={handleUpload}
        disabled={busy}
        className={`px-4 py-2 rounded-lg text-white transition ${busy ? "bg-gray-400 cursor-not-allowed" : "bg-accent hover:opacity-90"}`}
      >
        {busy ? "Uploading…" : "Upload"}
      </button>

      {/* Status list */}
      {Object.keys(progress).length > 0 && (
        <div className="mt-5">
          <h3 className="font-semibold text-ink mb-2">Upload status</h3>
          <ul className="space-y-1 text-sm">
            {files.map((f) => (
              <li key={f.name} className="flex justify-between border-b border-gray-100 py-1">
                <span className="truncate pr-2">{f.name}</span>
                <span className="text-subink">{progress[f.name]}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {summary && <div className="text-sm text-ink mt-3">{summary}</div>}
    </div>
  );
}
