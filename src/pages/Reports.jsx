import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Reports() {
  const [tree, setTree] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);

      // Top-level = Job Codes
      const { data: jobs, error: jobsErr } = await supabase
        .storage
        .from("reports")
        .list("", { limit: 1000, sortBy: { column: "name", order: "asc" } });

      if (jobsErr) {
        console.error("Jobs list error:", jobsErr);
        setLoading(false);
        return;
      }

      const result = [];

      for (const job of jobs || []) {
        // second level = Categories
        const { data: cats, error: catsErr } = await supabase
          .storage
          .from("reports")
          .list(job.name, { limit: 100, sortBy: { column: "name", order: "asc" } });

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
              return { name: f.name, path: fullPath, url: data.publicUrl };
            });

          if (fileItems.length) groups.push({ category: c.name, files: fileItems });
        }

        if (groups.length) result.push({ job: job.name, groups });
      }

      setTree(result);
      setLoading(false);
    }

    load();
  }, []);

  if (loading) return <p className="p-4">Loading…</p>;

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-6">Available Reports</h2>

      {tree.length === 0 && <p>No reports found yet.</p>}

      {tree.map(({ job, groups }) => (
        <div key={job} className="mb-10">
          <h3 className="text-lg font-semibold mb-3">{job}</h3>
          <div className="pl-4 border-l">
            {groups.map(({ category, files }) => (
              <div key={category} className="mb-4">
                <div className="font-medium text-gray-700 mb-1">{category}</div>
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
              </div>
            ))}
          </div>
          <hr className="mt-4" />
        </div>
      ))}
    </div>
  );
}
