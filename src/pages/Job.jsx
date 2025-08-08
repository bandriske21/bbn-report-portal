import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { JOB_ADDRESS } from "../data/jobAddress";

const LABELS = [
  "Clearance Reports",
  "Air Monitoring Reports",
  "Asbestos ID",
  "Asbestos Surveys",
];

const slug = (s) =>
  s.trim()
    .replace(/[\\/]+/g, "-")
    .replace(/\s+/g, " ")
    .replace(/[^\w.\- ]+/g, "")
    .replace(/\s/g, "-");

export default function Job() {
  const { jobCode } = useParams();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const results = [];

      for (const label of LABELS) {
        const paths = [
          `${jobCode}/${label}`,        // space version
          `${jobCode}/${slug(label)}`,  // hyphen version
        ];

        let items = [];

        for (const folderPath of paths) {
          const { data: files, error } = await supabase.storage
            .from("reports")
            .list(folderPath, { limit: 1000, sortBy: { column: "name", order: "asc" } });
          if (error) continue;

          items = items.concat(
            (files || [])
              .filter((f) => !f.name.endsWith("/"))
              .map((f) => {
                const fullPath = `${folderPath}/${f.name}`;
                const { data } = supabase.storage.from("reports").getPublicUrl(fullPath);
                return { name: f.name, path: fullPath, url: data.publicUrl };
              })
          );
        }

        results.push({ category: label, files: items });
      }

      setGroups(results);
      setLoading(false);
    }
    load();
  }, [jobCode]);

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">
          Job: {jobCode}{JOB_ADDRESS[jobCode] ? ` — ${JOB_ADDRESS[jobCode]}` : ""}
        </h2>
        <Link to="/jobs" className="text-blue-600 hover:underline">← All Jobs</Link>
      </div>

      {loading && <p>Loading…</p>}

      {!loading && (
        <div className="space-y-8">
          {groups.map(({ category, files }) => (
            <section key={category}>
              <h3 className="text-lg font-semibold mb-2">{category}</h3>
              {files.length === 0 ? (
                <p className="text-sm text-gray-600">No reports yet.</p>
              ) : (
                <ul className="divide-y">
                  {files.map((f) => (
                    <li key={f.path} className="py-2 flex justify-between">
                      <span className="truncate pr-4">{f.name}</span>
                      <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        Download
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
