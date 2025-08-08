// src/pages/Job.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { JOB_ADDRESS } from "../data/jobAddress";
import { loadAddressMap } from "../lib/addressMap";
import { useAuth } from "../lib/AuthContext";
import Skeleton from "../components/Skeleton";

const CATEGORIES = [
  "Clearance Reports",
  "Air Monitoring Reports",
  "Asbestos ID",
  "Asbestos Surveys",
];

// Simple slug for back-compat (Air Monitoring Reports -> Air-Monitoring-Reports)
const slug = (s) =>
  s.trim()
    .replace(/[\\/]+/g, "-")
    .replace(/\s+/g, " ")
    .replace(/[^\w.\- ]+/g, "")
    .replace(/\s/g, "-");

export default function Job() {
  const { jobCode } = useParams();
  const { role } = useAuth();
  const canUpload = role === "admin" || role === "uploader";

  const [addrMap, setAddrMap] = useState({});
  const [groups, setGroups] = useState([]); // [{ category, files: [{name, url, path}] }]
  const [loading, setLoading] = useState(true);

  // Load latest address map (live JSON merged with local fallback)
  useEffect(() => {
    (async () => {
      const live = await loadAddressMap();
      setAddrMap({ ...JOB_ADDRESS, ...live });
    })();
  }, []);

  // Fetch files for each category (check both space + hyphen folder names)
  useEffect(() => {
    async function load() {
      setLoading(true);
      const results = [];

      for (const label of CATEGORIES) {
        const folderCandidates = [
          `${jobCode}/${label}`,         // space version
          `${jobCode}/${slug(label)}`,   // hyphen version
        ];

        let items = [];

        for (const folderPath of folderCandidates) {
          const { data: files, error } = await supabase.storage
            .from("reports")
            .list(folderPath, { limit: 1000, sortBy: { column: "name", order: "asc" } });

          if (error) continue;

          items = items.concat(
            (files || [])
              .filter((f) => !f.name.endsWith("/"))
              .map((f) => {
                const fullPath = `${folderPath}/${f.name}`;

                // Public URL (quick). For extra security later, switch to createSignedUrl().
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
    <div className="relative">
      <div className="bg-card rounded-2xl shadow-card p-6 hover:shadow-cardHover transition max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-2xl font-semibold text-ink">
            Job: {jobCode}{addrMap[jobCode] ? ` — ${addrMap[jobCode]}` : ""}
          </h2>
          <Link to="/jobs" className="text-accent hover:opacity-80 transition">
            ← All Jobs
          </Link>
        </div>
        <p className="text-subink text-sm mb-6">
          Browse this job’s report folders. {canUpload ? "Add reports directly to a category." : "Download the files you need."}
        </p>

        {loading ? (
          <Skeleton rows={6} />
        ) : (
          <div className="space-y-6">
            {groups.map(({ category, files }) => (
              <section key={category} className="bg-white border border-gray-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-gray-800">{category}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                      {files.length} file(s)
                    </span>
                    {canUpload && (
                      <a
                        href={`/#/?job=${encodeURIComponent(jobCode)}&category=${encodeURIComponent(category)}`}
                        className="text-accent text-sm hover:opacity-80"
                      >
                        Add here →
                      </a>
                    )}
                  </div>
                </div>

                {files.length === 0 ? (
                  <p className="text-sm text-subink">No reports yet.</p>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {files.map((f) => (
                      <li key={f.path} className="py-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {/* Minimal file icon */}
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
                )}
              </section>
            ))}
          </div>
        )}
      </div>

      {/* Floating Add Reports button (only BBN staff) */}
      {canUpload && (
        <a
          href={`/#/?job=${encodeURIComponent(jobCode)}`}
          className="fixed bottom-6 right-6 rounded-full px-5 py-3 bg-accent text-white shadow-cardHover hover:opacity-90 transition"
          title="Add Reports"
        >
          + Add Reports
        </a>
      )}
    </div>
  );
}
