import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase"; // Adjust path if needed

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [newJobNumber, setNewJobNumber] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newStatus, setNewStatus] = useState("Pending"); // Default matches DB
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch projects (existing code)
  useEffect(() => {
    async function fetchProjects() {
      const { data, error } = await supabase.from("projects").select("*");
      if (error) console.error("Fetch error:", error);
      else setProjects(data);
      setLoading(false);
    }
    fetchProjects();

    // Realtime subscription (existing)
    const subscription = supabase.channel("projects").on("postgres_changes", { event: "*", schema: "public", table: "projects" }, (payload) => {
      fetchProjects(); // Refresh on change
    }).subscribe();
    return () => supabase.removeChannel(subscription);
  }, []);

  const handleAddProject = async () => {
    if (!newJobNumber || !newAddress) return setError("Missing fields.");
    if (!/^BBN\.\d{4}$/.test(newJobNumber)) return setError("Job number must be BBN.XXXX (4 digits).");

    const { error: insertError } = await supabase.from("projects").insert({
      job_number: newJobNumber,
      address: newAddress,
      status: newStatus,
    });
    if (insertError) setError("Insert failed: " + insertError.message);
    else {
      setError("");
      setNewJobNumber("");
      setNewAddress("");
      setNewStatus("Pending");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Projects</h2>
      {/* Add Form */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Job Number (e.g., BBN.2025)"
          value={newJobNumber}
          onChange={(e) => setNewJobNumber(e.target.value)}
          className="border p-2 w-full mb-2"
        />
        <input
          type="text"
          placeholder="Address"
          value={newAddress}
          onChange={(e) => setNewAddress(e.target.value)}
          className="border p-2 w-full mb-2"
        />
        <select
          value={newStatus}
          onChange={(e) => setNewStatus(e.target.value)}
          className="border p-2 w-full mb-2"
        >
          <option value="Pending">Pending</option>
          <option value="Private">Private</option>
          <option value="Public">Public</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Archived">Archived</option>
        </select>
        <button onClick={handleAddProject} className="bg-bbnOrange text-white px-4 py-2 rounded">
          Add Project
        </button>
        {error && <p className="text-red-600 mt-2">{error}</p>}
      </div>
      {/* Project List - existing code with creative status badges */}
      <ul>
        {projects.map((project) => (
          <li key={project.id} className="border-b py-2 flex justify-between">
            <span>
              {project.job_number} - {project.address}
              <span className={`ml-2 px-2 py-1 rounded text-white ${getStatusColor(project.status)}`}>
                {project.status}
              </span>
            </span>
            {/* Links to details/upload */}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Creative helper: Color badges based on status
function getStatusColor(status) {
  switch (status) {
    case "Pending": return "bg-yellow-500";
    case "In Progress": return "bg-blue-500";
    case "Completed": return "bg-green-500";
    case "Archived": return "bg-gray-500";
    default: return "bg-gray-300";
  }
}