import { useEffect, useState, useMemo } from "react";
import { supabase } from "../lib/supabase";
import { JOB_ADDRESS } from "../data/jobAddress";

const isJobCode = (name) => /^BBN\.\d+$/.test(name);

export default function Reports() {
  const [tree, setTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState(""); // ← search query

  useEffect(() => {
    async function load() {
      setLoading(true);

      // 1) List top-level folders (only BBN.#### are jobs)
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

      // 2) For each job, list categories + files
      for (const job of jobsOnly) {
        const { data: cats, error: catsErr } = await supabase
          .storage
          .from("reports")
          .list(job.name, { limit: 200, sortBy: { column: "name", order: "asc" } });

        if (catsErr) continue;

        const groups = [];

        for (const c of cats || []) {
          const folderPath = `${job.name}/${c.name}`;
          const { data: files, error: filesErr } = await supabase
            .storage
            .from("reports")
            .list(folderPath, { limit: 1000, sortBy: { column: "name", order: "asc" } });

          if (filesErr) continue;

          const fileItems = (files || [])
            .filter((f) => !f.name.endsWith("/"))
            .map((f) => {
              const fullPath = `${folderPath}/${f.name}`;
              const { data } = supabase.storage.from("reports").getPublicUrl(fullPath);
              return {
                name: f.name,
                path: fullPath,
                url: data.publicUrl,
                category: c.name,
              };
            });

          if (fileItems.length) {
            groups.push({ category: c.name, files: fileItems });
          }
        }

        result.push({
          job: job.name,
          address: JOB_ADDRESS[job.name] || "",
          groups,
        });
      }

      setTree(result);
      setLoading(false);
    }

    load();
  }, []);

  // Filter on job code, address, category, or filename
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return tree;
    return tree
      .map(({ job, address, groups }) => {
        // filter files inside each category
        const filteredGroups = groups
          .map(({ category, files }) => ({
            category,
            files: files.filter(
              (f) =>
                f.name.toLowerCase().includes(needle) ||
                category.toLowerCase().includes(needle)
            ),
          }))
          .filter(
            (g) =>
              g.files.length > 0 ||
              g.category.toLowerCase().includes(needle)
          );

        // Keep a job if:
        // - job code or address matches, OR
        // - any group/files remain after filtering
        const jobMatches =
          job.toLowerCase().includes(needle) ||
          address.toLowerCase().includes(needle);

        if (jobMatches || filteredGroups.length > 0) {
          return { job, address, groups: filteredGroups };
        }
        return null;
      })
      .filter(Boolean);
  }, [q, tree]);

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">All Reports</h2>
        <input
          className="border p-2 rounded w-80"
          placeholder="Search job code, address, category, or filename…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {loading && <p className="p-4">Loading…</p>}
      {!loading && filtered.length === 0 && <p>No reports found.</p>}

      {filtered.map(({ job, address, groups }) => (
        <div key={job} className="mb-10">
          <h3 className="text-lg font-semibold mb-1">
            {job}{address ? ` — ${address}` : ""}
          </h3>
          <div className="pl-4 border-l">
            {groups.map(({ category, files }) => (
              <section key={category} className="mb-4">
                <div className="font-medium text-gray-700 mb-1">{category}</div>
                {files.length === 0 ? (
                  <p className="text-sm text-gray-600">No reports yet.</p>
                ) : (
                  <ul className="divide-y">
                    {files.map((f) => (
                      <li key={f.path} className="py-2 flex justify-between">
                        <span className="truncate pr-4">{f.name}</span>
                        <a
                          href={f.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Download
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
          <hr className="mt-4" />
        </div>
      ))}
    </div>
  );
}
