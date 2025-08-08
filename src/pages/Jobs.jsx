import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { JOB_ADDRESS } from "../data/jobAddress";

const isJobCode = (name) => /^BBN\.\d+$/.test(name);

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data, error } = await supabase.storage.from("reports").list("", {
        limit: 1000,
        sortBy: { column: "name", order: "asc" },
      });
      if (error) {
        console.error(error);
        setJobs([]);
        setLoading(false);
        return;
      }

      const top = (data || []).filter(i => isJobCode(i.name)); // hide non-job folders

      // Count files under each job (optional but nice)
      const withCounts = await Promise.all(
        top.map(async (j) => {
          let total = 0;
          const { data: cats } = await supabase.storage.from("reports").list(j.name, {
            limit: 200,
            sortBy: { column: "name", order: "asc" },
          });
          for (const c of cats || []) {
            const { data: files } = await supabase.storage.from("reports").list(`${j.name}/${c.name}`, {
              limit: 1000,
              sortBy: { column: "name", order: "asc" },
            });
            total += (files || []).filter(f => !f.name.endsWith("/")).length;
          }
          return { job: j.name, count: total };
        })
      );

      setJobs(withCounts);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = jobs.filter(({ job }) =>
    job.toLowerCase().includes(q.toLowerCase()) ||
    (JOB_ADDRESS[job]?.toLowerCase() || "").includes(q.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Jobs</h2>
        <input
          className="border p-2 rounded w-80"
          placeholder="Search job code or address…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {loading && <p>Loading…</p>}
      {!loading && filtered.length === 0 && <p>No jobs found.</p>}

      <div className="divide-y">
        {filtered.map(({ job, count }) => (
          <div key={job} className="py-3 flex items-center justify-between">
            <div>
              <div className="font-semibold">
                {job}{JOB_ADDRESS[job] ? ` — ${JOB_ADDRESS[job]}` : ""}
              </div>
              <div className="text-sm text-gray-600">{count} file(s)</div>
            </div>
            <Link
              to={`/jobs/${encodeURIComponent(job)}`}
              className="bg-bbnNavy text-white px-3 py-2 rounded hover:opacity-90"
            >
              View
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
