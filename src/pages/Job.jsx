// src/pages/Job.jsx
import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { DESIGN_MODE } from "../lib/config";
// import { supabase } from "../lib/supabase"; // enable later when DESIGN_MODE = false

// --- The same jobs list we showed on /jobs (so we can match meta) ---
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

// --- Mock files per job/category (you can add more demo names if you want) ---
const MOCK_FILES = {
  "BBN.4342": {
    "Clearance Reports": [
      { name: "BBN.4342_CL_01.pdf" },
      { name: "BBN.4342_CL_02.pdf" },
    ],
    "Air Monitoring Reports": [
      { name: "BBN.4342_AM_01.pdf" },
      { name: "BBN.4342_AM_02.pdf" },
      { name: "BBN.4342_AM_03.pdf" },
    ],
    "Asbestos ID": [],
    "Asbestos Surveys": [],
  },
  "BBN.4391": {
    "Clearance Reports": [{ name: "BBN.4391_CL_01.pdf" }],
    "Air Monitoring Reports": [],
    "Asbestos ID": [],
    "Asbestos Surveys": [{ name: "BBN.4391_SV_01.pdf" }],
  },
  "BBN.4410": {
    "Clearance Reports": [],
    "Air Monitoring Reports": Array.from({ length: 6 }).map((_, i) => ({
      name: `BBN.4410_AM_${String(i + 1).padStart(2, "0")}.pdf`,
    })),
    "Asbestos ID": [],
    "Asbestos Surveys": [],
  },
  "BBN.4421": {
    "Clearance Reports": [],
    "Air Monitoring Reports": [],
    "Asbestos ID": [{ name: "BBN.4421_ID_01.pdf" }],
    "Asbestos Surveys": [],
  },
};

const CATEGORIES = [
  "Clearance Reports",
  "Air Monitoring Reports",
  "Asbestos ID",
  "Asbestos Surveys",
];

export default function Job() {
  const { jobCode } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState(null); // { job, address, count }
  const [filesByCategory, setFilesByCategory] = useState({});

  // Load either mock (DESIGN_MODE) or real
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      if (DESIGN_MODE) {
        // Simulate a tiny delay to show skeletons
        setTimeout(() => {
          if (cancelled) return;
          const job = decodeURIComponent(jobCode || "");
          const m = MOCK_JOBS.find((j) => j.job === job);
          if (!m) {
            // If someone typed a wrong URL, go back to jobs
            navigate("/jobs", { replace: true });
            return;
          }
          setMeta(m);
          setFilesByCategory(MOCK_FILES[job] || {});
          setLoading(false);
        }, 250);
        return;
      }

      // TODO: When DESIGN_MODE = false
      // 1) look up job meta (job, address, count) from your table/view
      // 2) list the files in Supabase Storage for each category path
      //    `${job} — ${address}/<Category>/...`
      // setMeta({ ... });
      // setFilesByCategory({ ... });
      // setLoading(false);
    }

    load();
    return () => (cancelled = true);
  }, [jobCode, navigate]);

  const title = useMemo(() => {
    if (meta) return `${meta.job} — ${meta.address}`;
    return "Loading…";
  }, [meta]);

  return (
    <div className="relative">
      {/* Back + title */}
      <div className="flex items-center justify-between mb-4">
        <Link
          to="/jobs"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          ← All Jobs
        </Link>
        {/* Floating Add Reports CTA (optional) */}
        <Link
          to="/"
          className="hidden sm:inline-block rounded-full bg-accent text-white px-4 py-2 hover:opacity-90 transition"
          title="Add reports"
        >
          Add Reports
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-card p-6">
        <h2 className="text-2xl font-semibold text-ink">{title}</h2>
        <p className="text-sm text-subink mt-1">
          Reports grouped into categories. Click “Download” to fetch a file.
        </p>

        {loading ? (
          <SkeletonCategories />
        ) : (
          <div className="mt-6 space-y-8">
            {CATEGORIES.map((cat) => (
              <CategorySection
                key={cat}
                title={cat}
                files={filesByCategory[cat] || []}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CategorySection({ title, files }) {
  return (
    <section>
      <h3 className="text-xl font-semibold text-ink mb-3">{title}</h3>

      {files.length === 0 ? (
        <div className="text-subink">No reports yet.</div>
      ) : (
        <div className="rounded-xl border border-gray-200 divide-y bg-white">
          {files.map((f, idx) => (
            <div
              key={`${f.name}-${idx}`}
              className="flex items-center justify-between gap-4 px-4 py-3"
            >
              <div className="min-w-0">
                <div className="text-sm font-medium text-ink truncate">
                  {f.name}
                </div>
              </div>
              {/* Download button.
                  In Design Mode we just prevent default.
                  Later we’ll set actual signed URLs from Supabase. */}
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                Download
              </a>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function SkeletonCategories() {
  return (
    <div className="mt-6 space-y-8">
      {[0, 1, 2, 3].map((i) => (
        <div key={i}>
          <div className="h-5 w-48 bg-gray-200 rounded mb-3 animate-pulse" />
          <div className="rounded-xl border border-gray-200">
            {[0, 1, 2].map((j) => (
              <div
                key={j}
                className="flex items-center justify-between gap-4 px-4 py-3 animate-pulse"
              >
                <div className="h-4 w-64 bg-gray-200 rounded" />
                <div className="h-4 w-20 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
