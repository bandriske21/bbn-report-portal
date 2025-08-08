
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Reports() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFiles() {
      const { data, error } = await supabase.storage.from("reports").list("", {
        limit: 100,
        offset: 0,
        sortBy: { column: "name", order: "asc" },
      });
      if (error) {
        console.error("Error fetching files:", error);
      } else {
        setFiles(data);
      }
      setLoading(false);
    }
    fetchFiles();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Available Reports</h2>
      {files.length === 0 && <p>No reports found.</p>}
      <ul>
        {files.map((file) => (
          <li key={file.name} className="border-b py-2 flex justify-between">
            <span>{file.name}</span>
            <a
              href={`${supabase.storage.from("reports").getPublicUrl(file.name).data.publicUrl}`}
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
  );
}
