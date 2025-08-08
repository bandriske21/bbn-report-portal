import { useState, useRef } from "react";
import { supabase } from "../lib/supabase";
import { saveAddress } from "../lib/addressMap";

const CATEGORIES = [
  "Clearance Reports",
  "Air Monitoring Reports",
  "Asbestos ID",
  "Asbestos Surveys",
];

export default function Upload() {
  const [jobCode, setJobCode] = useState("");      // e.g. BBN.4342
  const [jobAddress, setJobAddress] = useState(""); // full address
  const [category, setCategory] = useState("");
  const [files, setFiles] = useState([]);
  const [progress, setProgress] = useState({});
  const [summary, setSummary] = useState("");
  const dropRef = useRef(null);

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

  async function handleUpload() {
    const code = jobCode.trim();
    const addr = jobAddress.trim();

    // Must be in the format BBN.####, numbers after the dot
    const isValid = /^BBN\.\d+$/.test(code);
    if (!isValid) {
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

    let ok = 0, bad = 0;

    // upload each file under /<JobCode>/<Category>/<filename>
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

    // Save/refresh the address map (so Jobs/Reports can show it)
    try {
      if (addr) await saveAddress(code, addr);
    } catch (e) {
      console.warn("Address map save failed (non-fatal):", e);
    }

    setSummary(`Upload finished: ${ok} succeeded, ${bad} failed.`);
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow space-y-4">
      <h2 className="text-2xl font-bold">Add Reports</h2>

      {/* Job Code */}
      <div>
        <label className="block text-sm font-medium mb-1">Job Code (e.g. BBN.4342)</label>
        <input
          className="border p-2 w-full rounded"
          placeholder="BBN.4342"
          value={jobCode}
          onChange={(e) => setJobCode(e.target.value)}
        />
        <p className="text-xs text-gray-500 mt-1">
          Files will be stored under this job code.
        </p>
      </div>

      {/* Job Address */}
      <div>
        <label className="block text-sm font-medium mb-1">Job Address</label>
        <input
          className="border p-2 w-full rounded"
          placeholder="55 Eden Ave, Coolangatta QLD 4225"
          value={jobAddress}
          onChange={(e) => setJobAddress(e.target.value)}
        />
        <p className="text-xs text-gray-500 mt-1">
          This will appear as “BBN.#### — Address” on the Jobs & Reports pages.
        </p>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium mb-1">Category</label>
        <select
          className="border p-2 w-full rounded"
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
        className="border-2 border-dashed rounded p-6 text-center bg-gray-50"
      >
        <p className="mb-2">Drag & drop PDFs here, or</p>
        <label className="inline-block cursor-pointer bg-bbnOrange text-white px-4 py-2 rounded">
          Choose files
          <input type="file" accept="application/pdf" multiple className="hidden" onChange={onChoose} />
        </label>
        {files.length > 0 && (
          <p className="text-sm text-gray-600 mt-2">{files.length} file(s) selected</p>
        )}
      </div>

      <button
        onClick={handleUpload}
        className="bg-bbnNavy text-white px-4 py-2 rounded hover:opacity-90"
      >
        Upload
      </button>

      {/* Status list */}
      {Object.keys(progress).length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Upload status</h3>
          <ul className="space-y-1 text-sm">
            {files.map((f) => (
              <li key={f.name} className="flex justify-between border-b py-1">
                <span className="truncate pr-2">{f.name}</span>
                <span className="text-gray-600">{progress[f.name]}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {summary && <div className="text-sm mt-2">{summary}</div>}
    </div>
  );
}
