import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getProjects,
  createProject,
  deleteProject,
} from "../api/projectApi";

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const loadProjects = async () => {
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreateProject = async () => {
    if (!name.trim()) {
      alert("Project name is required");
      return;
    }

    try {
      await createProject({
        name,
        description,
      });

      setName("");
      setDescription("");

      loadProjects();
    } catch (error) {
      console.error(error);
      alert("Failed to create project");
    }
  };

  const handleDeleteProject = async (id) => {
    try {
      await deleteProject(id);
      loadProjects();
    } catch (error) {
      console.error(error);
      alert("Failed to delete project");
    }
  };

  return (
    <div
      style={{
        padding: "30px",
        maxWidth: "1000px",
        margin: "0 auto",
      }}
    >
      <h1>DevForge AI Dashboard</h1>

      <div
        style={{
          border: "1px solid #ddd",
          padding: "20px",
          marginBottom: "30px",
          borderRadius: "10px",
        }}
      >
        <h2>Create Project</h2>

        <input
          type="text"
          placeholder="Project Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "10px",
          }}
        />

        <textarea
          placeholder="Project Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "10px",
            height: "100px",
          }}
        />

        <button onClick={handleCreateProject}>
          Create Project
        </button>
      </div>

      <h2>Projects</h2>

      {projects.length === 0 ? (
        <p>No projects found.</p>
      ) : (
        projects.map((project) => (
          <div
            key={project.id}
            style={{
              border: "1px solid #ddd",
              padding: "15px",
              marginBottom: "15px",
              borderRadius: "10px",
            }}
          >
            <h3>{project.name}</h3>

            <p>{project.description}</p>

            <div
              style={{
                display: "flex",
                gap: "10px",
              }}
            >
              <Link to={`/project/${project.id}`}>
                Open Workspace
              </Link>

              <button
                onClick={() =>
                  handleDeleteProject(project.id)
                }
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default Dashboard;