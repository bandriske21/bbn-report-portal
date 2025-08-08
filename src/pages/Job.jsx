import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { loadAddressMap } from "../lib/addressMap";
import { JOB_ADDRESS } from "../data/jobAddress";

const isJobCode = (name) => /^BBN\.\d+$/.test(name);

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [addrMap, setAddrMap] = useState({});

  // Load address map (live + local fallback)
  useEffect(() => {
    (async () => {
      const live = await loadAddressMap();
      setAddrMap({ ...JOB_ADDRESS, ...live });
    })();
  }, []);

  // Load job folders & counts
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

      const top = (data || []).filter((i) => isJobCode(i.name));

      const withCounts = await Promise.all(
        top.map(async (j) => {
          let total = 0;
          const { data: cats } = await supabase.storage
            .from("reports")
            .list(j.name, { limit: 200, sortBy: { column: "name", order: "asc" } });

          for (const c of cats || []) {
            const { data: files } = await supabase.storage
              .from("reports")
              .list(`${j.name}/${c.name}`, {
                limit: 1000,
                sortBy: { column: "name", order: "asc" },
              });
            total += (files || []).filter((f) => !f.name.endsWith("/")).length;
          }

          return { job: j.name, count: total };
        })
      );

      setJobs(withCounts);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = jobs.filter(({ job }) => {
    const address = addrMap[job] || "";
    const needle = q.toLowerCase();
    return (
      job.toLowerCase().includes(needle) ||
      address.toLowerCase().includes(needle)
    );
  });

  return (
    <div className="bg-card rounded-2xl shadow-card p-6 hover:shadow-cardHover transition max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-ink">Jobs</h2>
        <input
          className="border border-gray-200 rounded-lg px-4 py-2 w-80 bg-white focus:outline-none focus:ring-2 focus:ring-accent"
          placeholder="Search job code or address…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {loading && <p className="text-subink">Loading…</p>}
      {!loading && filtered.length === 0 && <p className="text-subink">No jobs found.</p>}

      <ul className="divide-y divide-gray-100">
        {filtered.map(({ job, count }) => (
          <li key={job} className="py-3 flex items-center justify-between">
            <div>
              <div className="font-medium text-ink">
                {job}{addrMap[job] ? ` — ${addrMap[job]}` : ""}
              </div>
              <div className="text-sm text-subink">{count} file(s)</div>
            </div>
            <Link
              to={`/jobs/${encodeURIComponent(job)}`}
              className="bg-accent text-white px-3 py-2 rounded-lg hover:opacity-90 transition"
            >
              View
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
