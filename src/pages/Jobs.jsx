// src/pages/Jobs.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { DESIGN_MODE } from "../lib/config";
// import { supabase } from "../lib/supabase"; // we'll re-enable when DESIGN_MODE = false

// ------- Mock data for Design Mode -------
const MOCK_JOBS = [
  {
    job: "BBN.4342",
    address: "55 Eden Ave, Coolangatta QLD 4225",
    count: 9,
  },
  {
    job: "BBN.4391",
    address: "50 Meiers Rd, Indooroopilly QLD 4068",
    count: 3,
  },
  {
    job: "BBN.4410",
    address: "309 North Quay, Brisbane QLD 4000",
    count: 18,
  },
  {
    job: "BBN.4421",
    address: "3 Morse St, Newstead QLD 4006",
    count: 5,
  },
];

// Tiny inline icon so we don’t need another file
function FolderIcon({ className = "w-9 h-9" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M10.5 6H5.75A1.75 1.75 0 004 7.75v8.5c0 .966.784 1.75 1.75 1.75h12.5A1.75 1.75 0 0020 16.25v-6.5A1.75 1.75 0 0018.25 8H12l-.707-.707A2 2 0 0010.5 6z" />
    </svg>
  );
}

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  // Load data (mock in design mode, otherwise Supabase later)
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      if (DESIGN_MODE) {
        // Simulate async/latency so we see the skeleton once
        setTimeout(() => {
          if (!cancelled) {
            setJobs(MOCK_JOBS);
            setLoading(false);
          }
        }, 350);
        return;
      }

      // TODO: When DESIGN_MODE = false, uncomment and fetch real data.
      // const { data, error } = await supabase
      //   .from("your_jobs_source_view")
      //   .select("*")
      //   .order("job", { ascending: true });
      // if (error) console.error(error);
      // setJobs(data ?? []);
      // setLoading(false);
    }

    load();
    return () => (cancelled = true);
  }, []);

  const filtered = useMemo(() => {
    if (!q.trim()) return jobs;
    const needle = q.toLowerCase();
    return jobs.filter(
      (j) =>
        j.job.toLowerCase().includes(needle) ||
        j.address.toLowerCase().includes(needle)
    );
  }, [jobs, q]);

  return (
    <div className="bg-white rounded-2xl shadow-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-2">
        <div>
          <h2 className="text-2xl font-semibold text-ink">Jobs</h2>
          <p className="text-sm text-subink">
            Browse all jobs. Click a job to view its report folders.
          </p>
        </div>

        <div className="w-full sm:w-96">
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search job code or address…"
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </div>

      {/* Body */}
      {loading ? (
        <div className="mt-6 space-y-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-gray-200 bg-white shadow-sm p-4 flex items-center gap-4 animate-pulse"
            >
              <div className="w-12 h-12 rounded-xl bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-2/5" />
                <div className="h-3 bg-gray-200 rounded w-3/5" />
              </div>
              <div className="h-6 bg-gray-200 rounded w-20" />
              <div className="h-9 bg-gray-200 rounded w-24" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-8 text-subink">No jobs found.</div>
      ) : (
        <div className="mt-4 space-y-3">
          {filtered.map(({ job, address, count }) => (
            <JobCard
              key={job}
              job={job}
              address={address}
              count={count}
              to={`/jobs/${encodeURIComponent(job)}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function JobCard({ job, address, count, to }) {
  return (
    <div className="group rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-cardHover transition p-4 flex items-center gap-4">
      {/* Icon bubble */}
      <div className="relative">
        <div className="w-12 h-12 rounded-xl bg-gray-900 text-white grid place-items-center">
          <FolderIcon className="w-7 h-7 opacity-90" />
        </div>
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="text-[15px] font-semibold text-ink truncate">
          {job} — {address}
        </div>
        <div className="text-xs text-subink mt-0.5">{count} file(s)</div>
      </div>

      {/* Count chip (right) */}
      <div className="hidden sm:block">
        <span className="text-xs bg-gray-100 text-ink px-2 py-1 rounded-lg">
          {count} files
        </span>
      </div>

      {/* CTA */}
      <Link
        to={to}
        className="ml-2 bg-accent text-white px-4 py-2 rounded-lg hover:opacity-90 transition whitespace-nowrap"
      >
        View
      </Link>
    </div>
  );
}
