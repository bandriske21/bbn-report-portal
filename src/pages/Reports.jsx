import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Reports() {
  const [tree, setTree] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);

      // 1) List all top-level "job address" folders
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
        // 2) For each job folder, list report type folders
        const { data: types, error: typesErr } = await supabase
          .storage
          .from("reports")
          .list(job.name, { limit: 100, sortBy: { column: "name", order: "asc" } });

        if (typesErr) {
          console.error("Types list error:", typesErr);
          continue;
        }

        const groups = [];

        for (const t of types || []) {
          // 3) For each type folder, list files
          const folderPath = `${job.name}/${t.name}`;
          const { data: files, error: filesErr } = await supabase
            .storage
            .from("reports")
            .list(folderPath, { limit: 500, sortBy: { column: "name", order: "asc" } });

          if (filesErr) {
            console.error("Files list error:", filesErr);
            continue;
          }

          const fileItems = (files || [])
            .filter(f => !f.name.endsWith("/")) // skip any accidental nested folder markers
            .map(f => {
              const fullPath = `${folderPath}/${f.name}`;
              const { data } = supabase.storage.from("reports").getPublicUrl(fullPath);
              return { name: f.name, path: fullPath, url: data.publicUrl };
            });

          if (fileItems.length) groups.push({ type: t.name, files: fileItems });
        }

        if (groups.length) result.push({ job: job.name, groups });
      }

      setTree(result);
      setLoading(false);
    }

    load();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-6">Available Reports</h2>

      {tree.length === 0 && <p>No reports found.</p>}

      {tree.map(({ job, groups }) => (
        <div key={job} className="mb-8">
          <h3 className="text-lg font-semibold mb-2">{job}</h3>
          <div className="pl-4 border-l">
            {groups.map(({ type, files }) => (
              <div key={type} className="mb-4">
                <div className="font-medium text-gray-700 mb-1">{type}</div>
                <ul className="space-y-1">
                  {files.map((f) => (
                    <li key={f.path} className="flex justify-between items-center border-b py-2">
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
