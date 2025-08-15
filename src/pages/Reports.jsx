import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Reports() {
  const [fileTree, setFileTree] = useState({}); // Grouped: {jobAddress: {reportType: [files]}}
  const [loading, setLoading] = useState(true);
  const [expandedAddresses, setExpandedAddresses] = useState({});

  // Recursive function to fetch all files
  async function fetchAllFiles(currentPath = "") {
    const { data, error } = await supabase.storage.from("reports").list(currentPath, {
      limit: 100,
      offset: 0,
      sortBy: { column: "name", order: "asc" },
    });
    if (error) {
      console.error("Error fetching files:", error);
      return [];
    }
    let allFiles = [];
    for (const item of data) {
      const itemPath = currentPath ? `${currentPath}/${item.name}` : item.name;
      if (item.metadata === null) { // It's a folder (Supabase folders have null metadata)
        const subFiles = await fetchAllFiles(itemPath);
        allFiles = [...allFiles, ...subFiles];
      } else { // It's a file
        allFiles.push({ path: itemPath, name: item.name });
      }
    }
    return allFiles;
  }

  useEffect(() => {
    async function loadFiles() {
      const allFiles = await fetchAllFiles();
      // Group files: {jobAddress: {reportType: [{path, name}]}}
      const tree = allFiles.reduce((acc, file) => {
        const [addr, type] = file.path.split("/").slice(0, 2); // Assume path: addr/type/file
        if (!acc[addr]) acc[addr] = {};
        if (!acc[addr][type]) acc[addr][type] = [];
        acc[addr][type].push(file);
        return acc;
      }, {});
      setFileTree(tree);
      setLoading(false);
    }
    loadFiles();
  }, []);

  const toggleAddress = (addr) => {
    setExpandedAddresses((prev) => ({ ...prev, [addr]: !prev[addr] }));
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Available Reports</h2>
      {Object.keys(fileTree).length === 0 && <p>No reports found.</p>}
      <ul>
        {Object.entries(fileTree).map(([addr, types]) => (
          <li key={addr} className="border-b py-2">
            <button onClick={() => toggleAddress(addr)} className="font-bold">
              {addr} {expandedAddresses[addr] ? "▼" : "▶"}
            </button>
            {expandedAddresses[addr] && (
              <ul className="ml-4">
                {Object.entries(types).map(([type, files]) => (
                  <li key={type} className="py-1">
                    <span className="font-semibold">{type}</span>
                    <ul className="ml-4">
                      {files.map((file) => (
                        <li key={file.path} className="flex justify-between">
                          <span>{file.name}</span>
                          <a
                            href={supabase.storage.from("reports").getPublicUrl(file.path).data.publicUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            Download
                          </a>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
