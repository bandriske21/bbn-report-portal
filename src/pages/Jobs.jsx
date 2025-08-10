// src/pages/Jobs.jsx
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/AuthContext";
import Skeleton from "../components/Skeleton";

function AddJobModal({ open, onClose, onSaved }) {
  const [jobCode, setJobCode] = useState("");
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      setJobCode("");
      setAddress("");
      setSaving(false);
      setError("");
    }
  }, [open]);

  if (!open) return null;

  async function save() {
    setError("");
    if (!jobCode.trim() || !address.trim()) {
      setError("Please enter both a job code and an address.");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("jobs").insert({
      job_code: jobCode.trim(),
      address: address.trim(),
    });
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    onSaved(); // refresh list
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-xl font-semibold mb-2">Add Job</h2>
        <p className="text-subink mb-4">
          Enter the Job Code and the Site Address.
        </p>

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
          className="mb-4 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
          placeholder="123 Example St, Suburb, QLD 4000"
        />

        {error && (
          <div className="mb-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            onClick={save}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Jobs() {
  const { user } = useAuth();
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) setError(error.message);
    setJobs(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!q.trim()) return jobs;
    const s = q.toLowerCase();
    return jobs.filter(
      (j) =>
        j.job_code.toLowerCase().includes(s) ||
        j.address.toLowerCase().includes(s)
    );
  }, [q, jobs]);

  return (
    <>
      <AddJobModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={load}
      />

      <div className="bg-white rounded-2xl shadow-card p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Jobs</h1>
            <p className="text-subink">
              Browse all jobs. Click a job to view its report folders.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search job code or address..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-96 rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <button
              className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              onClick={() => setModalOpen(true)}
            >
              Add Job
            </button>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="mt-6 space-y-4">
            <Skeleton height="h-16" />
            <Skeleton height="h-16" />
            <Skeleton height="h-16" />
          </div>
        )}

        {/* List */}
        {!loading && !error && (
          <div className="mt-6 divide-y">
            {filtered.map((j) => (
              <div
                key={j.id}
                className="flex items-center justify-between py-4"
              >
                <div>
                  <div className="font-medium">{j.job_code}</div>
                  <div className="text-subink">{j.address}</div>
                </div>
                <div className="text-subink text-sm">
                  {new Date(j.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="text-subink text-sm mt-6">No jobs found.</div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
