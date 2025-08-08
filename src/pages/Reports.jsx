import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { loadAddressMap } from "../lib/addressMap";
import { JOB_ADDRESS } from "../data/jobAddress";
import Skeleton from "../components/Skeleton";

const isJobCode = (name) => /^BBN\.\d+$/.test(name);

export default function Reports() {
  const [tree, setTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [addrMap, setAddrMap] = useState({});

  useEffect(() => {
    (async () => {
      const live = await loadAddressMap();
      setAddrMap({ ...JOB_ADDRESS, ...live });
    })();
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data: topLevel, error: topErr } = await supabase
        .storage
        .from("reports")
        .list("", { limit: 1000, sortBy: { column: "name", order: "asc" } });

      if (topErr) {
        console.error("Top-level list error:", topErr);
        setTree([]);
        setLoading(false);
        return;
      }

      const jobsOnly = (topLevel || []).filter((i) => isJobCode(i.name));
      const result = [];

      for (const job of jobsOnly) {
        const { data: cats } = await supabase
          .storage
          .from("reports")
          .list(job.name, { limit: 200, sortBy: { column: "name", order: "asc" } });

        const groups = [];

        for (const c of cats || []) {
          const folderPath = `${job.name}/${c.name}`;
          const { data: files } = await supabase
            .storage
            .from("reports")
            .list(folderPath, { limit: 1000, sortBy: { column: "name", order: "asc" } });

          const fileItems = (files || [])
            .filter((f) => !f.name.endsWith("/"))
            .map((f) => {
              const fullPath = `${folderPath}/${f.name}`;
              const { data } = supabase.storage.from("reports").getPublicUrl(fullPath);
              return { name: f.name, path: fullPath, url: data.publicUrl, category: c.name };
            });

          if (fileItems.length) groups.push({ category: c.name, files: fileItems });
        }

        result.push({ job: job.name, address: addrMap[job.name] || "", groups });
      }

      setTree(result);
      setLoading(false);
    }
    load();
  }, [addrMap]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return tree;
    return tree
      .map(({ job, address, groups }) => {
        const filteredGroups = groups
          .map(({ category, files }) => ({
            category,
            files: files.filter(
              (f) =>
                f.name.toLowerCase().includes(needle) ||
                category.toLowerCase().includes(needle)
            ),
          }))
          .filter((g) => g.files.length > 0);

        const jobMatches =
          job.toLowerCase().includes(needle) ||
          (address || "").toLowerCase().includes(needle);

        if (jobMatches || filteredGroups.length > 0) return { job, address, groups: filteredGroups };
        return null;
      })
      .filter(Boolean);
  }, [q, tree]);

  return (
    <div className="bg-card rounded-2xl shadow-card p-6 hover:shadow-cardHover transition max-w-5xl mx-auto">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-ink">All Reports</h2>
        <input
          className="border border-gray-200 rounded-lg px-4 py-2 w-96 bg-white focus:outline-none focus:ring-2 focus:ring-accent"
          placeholder="Search job code, address, category, or filename…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <p className="text-subink text-sm mb-6">Search across jobs and categories. Click to download any file.</p>

      {loading ? (
        <Skeleton rows={6} />
      ) : filtered.length === 0 ? (
        <p className="text-subink">No reports found.</p>
      ) : (
        filtered.map(({ job, address, groups }) => (
          <div key={job} className="mb-8">
            <h3 className="text-lg font-semibold text-ink mb-2">
              {job}{address ? ` — ${address}` : ""}
            </h3>
            <div className="pl-4 border-l border-gray-100 space-y-3">
              {groups.map(({ category, files }) => (
                <section key={category} className="bg-white border border-gray-100 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-gray-800">{category}</div>
                    {/* badge for count */}
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                      {files.length} file(s)
                    </span>
                  </div>
                  <ul className="divide-y divide-gray-100">
                    {files.map((f) => (
                      <li key={f.path} className="py-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {/* PDF icon */}
                          <svg width="18" height="18" viewBox="0 0 24 24" className="text-accent">
                            <path fill="currentColor" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path fill="currentColor" d="M14 2v6h6"/>
                          </svg>
                          <span className="truncate pr-4">{f.name}</span>
                        </div>
                        <a
                          href={f.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent hover:opacity-80 transition"
                        >
                          Download
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
