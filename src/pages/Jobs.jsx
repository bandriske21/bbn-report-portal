// src/pages/Jobs.jsx (diagnostic)
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/AuthContext";
import Skeleton from "../components/Skeleton";
export default function Jobs() {
  const { user, role: contextRole } = useAuth(); // Renamed to avoid conflict
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [lastError, setLastError] = useState("");
  const [debugRole, setDebugRole] = useState(null);
  async function loadJobs() {
    setLoading(true);
    setLastError("");
    console.log("[JOBS] Loading jobs… user:", user?.email);
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select("id, job_code, address, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      console.log("[JOBS] SELECT ok, rows:", data?.length);
      setJobs(data || []);
    } catch (error) {
      console.error("[JOBS] SELECT error:", error);
      setLastError(error.message);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    async function fetchData() {
      await loadJobs();
      if (user) {
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("role")
            .eq("user_id", user.id)
            .single();
          if (error) throw error;
          setDebugRole(data ? data.role : "none");
        } catch (error) {
          console.error("[JOBS] LOAD ROLE error:", error);
          setDebugRole("error");
        }
      }
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return jobs;
    return jobs.filter(
      (j) =>
        j.job_code.toLowerCase().includes(t) ||
        j.address.toLowerCase().includes(t)
    );
  }, [jobs, q]);
  return (
    <div className="bg-white rounded-2xl shadow-card p-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-2xl font-semibold">Jobs</h1>
          <p className="text-subink">
            Browse all jobs. Click a job to view its report folders.
          </p>
          <div className="mt-2 text-xs text-subink">
            <strong>Debug:</strong> user={user?.email ?? "null"} | role={" "}
            {debugRole ?? "loading"}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search job code or address..."
            className="w-[360px] rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
          />
          {user && (
            <button
              onClick={() => setShowAdd(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Add Job
            </button>
          )}
        </div>
      </div>
      {lastError && (
        <div className="mb-4 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          Failed to load: {lastError}
        </div>
      )}
      {loading ? (
        <div className="space-y-4">
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-subink">No jobs found.</div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {filtered.map((j) => (
            <li key={j.id} className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-ink">{j.job_code}</div>
                  <div className="text-subink">{j.address}</div>
                </div>
                <Link
                  to={`/jobs/${encodeURIComponent(j.job_code)}`}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 hover:bg-gray-50"
                >
                  View
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
      {showAdd && (
        <AddJobModal
          onClose={() => setShowAdd(false)}
          onSaved={() => {
            setShowAdd(false);
            loadJobs();
          }}
          setLastError={setLastError}
        />
      )}
    </div>
  );
}
function AddJobModal({ onClose, onSaved, setLastError }) {
  const [jobCode, setJobCode] = useState("");
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);
  async function save() {
    setLastError("");
    if (!jobCode.trim() || !address.trim()) {
      alert("Please enter both Job Code and Site Address.");
      return;
    }
    setSaving(true);
    const payload = {
      job_code: jobCode.trim(),
      address: address.trim(),
    };
    console.log("[JOBS] INSERT payload:", payload);
    try {
      const { error } = await supabase.from("jobs").insert(payload);
      if (error) throw error;
      console.log("[JOBS] INSERT ok");
      onSaved();
    } catch (error) {
      console.error("[JOBS] INSERT error:", error);
      setLastError(error.message);
      alert(`Unable to save job: ${error.message}`);
    } finally {
      setSaving(false);
    }
  }
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-card p-6">
        <h2 className="text-xl font-semibold mb-4">Add Job</h2>
        <label className="block mb-2 text-sm font-medium text-subink">
          Job Code (e.g. BBN.4310)
        </label>
        <input
          value={jobCode}
          onChange={(e) => setJobCode(e.target.value)}
          className="mb-4 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
          placeholder="BBN.XXXX"
        />
        <label className="block mb-2 text-sm font-medium text-subink">
          Site Address
        </label>
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="mb-6 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
          placeholder="123 Example Street, City, State, Postcode"
        />
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Job"}
          </button>
        </div>
      </div>
    </div>
  );
}
