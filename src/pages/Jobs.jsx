import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { JOB_ADDRESS } from "../data/jobAddress";


export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      // Top-level folders are job codes
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

      // For each job folder, get a quick count of files beneath it
      const withCounts = await Promise.all(
        (data || []).map(async (j) => {
          let total = 0;
          // list categories under the job
          const { data: cats } = await supabase.storage.from("reports").list(j.name, {
            limit: 200,
            sortBy: { column: "name", order: "asc" },
          });
          for (const c of cats || []) {
            const folderPath = `${j.name}/${c.name}`;
            const { data: files } = await supabase.storage.from("reports").list(folderPath, {
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

  const filtered = jobs.filter(j =>
    j.job.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Jobs</h2>
        <input
          className="border p-2 rounded w-64"
          placeholder="Search job code…"
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
              <div className="font-semibold">{job}</div>
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
