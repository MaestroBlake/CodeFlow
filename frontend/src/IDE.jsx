import CodeEditor from "./CodeEditor";
import FileExplorer from "./FileExplorer";
import Terminal from "./Terminal";
import { useState, useEffect } from "react";

const API = "http://localhost:5000";

function IDE() {

    const [projects, setProjects] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState(null);

    const [files, setFiles] = useState({});
    const [selectedFile, setSelectedFile] = useState(null);

    const [terminalOutput, setTerminalOutput] = useState([]);

    const [loading, setLoading] = useState(true);

    // Fetch all projects when IDE loads
    useEffect(() => {

        async function loadProjects() {
            try {
                const response = await fetch(`${API}/api/projects`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error);
                }

                setProjects(data.projects);

                if (data.projects.length > 0) {
                    setSelectedProjectId(data.projects[0].project_id);
                }

            } catch (error) {
                console.error("Project loading failed:", error);
            } finally {
                setLoading(false);
            }
        }

        loadProjects();

    }, []);

    // Load files whenever selected project changes
    useEffect(() => {

        if (!selectedProjectId) {
            setFiles({});
            setSelectedFile(null);
            return;
        }

        let cancelled = false;

        async function loadFiles() {

            try {
                setFiles({});
                setSelectedFile(null);

                const response = await fetch(
                    `${API}/api/projects/${selectedProjectId}/files`
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error);
                }

                if (cancelled) return;

                const loadedFiles = {};

                data.files.forEach(file => {
                    loadedFiles[file.filename] = {
                        language: file.language,
                        content: file.content
                    };
                });

                setFiles(loadedFiles);

                const firstFile = Object.keys(loadedFiles)[0];

                setSelectedFile(firstFile || null);

            } catch (error) {
                console.error("File loading failed:", error);
            }
        }

        loadFiles();

        return () => {
            cancelled = true;
        };

    }, [selectedProjectId]);

    // Create a new project
    async function createProject() {

        const projectName = prompt("Enter project name:");

        if (!projectName || !projectName.trim()) return;

        try {

            const response = await fetch(`${API}/api/projects`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ projectName })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error);
            }

            setProjects(prev => [...prev, data.project]);

            setSelectedProjectId(data.project.project_id);

        } catch (error) {
            alert(error.message);
        }
    }

    // Automatically save editor changes
    useEffect(() => {

        if (!selectedProjectId || !selectedFile || !files[selectedFile]) {
            return;
        }

        const timer = setTimeout(async () => {

            try {

                const file = files[selectedFile];

                const response = await fetch(
                    `${API}/api/projects/${selectedProjectId}/files`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            filename: selectedFile,
                            language: file.language,
                            content: file.content
                        })
                    }
                );

                if (!response.ok) {
                    throw new Error("File autosave failed");
                }

                console.log("File saved:", selectedFile);

            } catch (error) {
                console.error(error);
            }

        }, 800);

        return () => clearTimeout(timer);

    }, [files, selectedFile, selectedProjectId]);

    if (loading) {
        return <h3>Loading CodeFlow...</h3>;
    }

    return (

        <main>

            <div className="project-toolbar">

                <h3>CodeFlow</h3>

                <select
                    value={selectedProjectId || ""}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                >

                    <option value="" disabled>
                        Select Project
                    </option>

                    {projects.map(project => (
                        <option
                            key={project.project_id}
                            value={project.project_id}
                        >
                            {project.project_name}
                        </option>
                    ))}

                </select>

                <button onClick={createProject}>
                    + New Project
                </button>

            </div>

            {selectedProjectId ? (

                <>

                    <FileExplorer
                        files={files}
                        setFiles={setFiles}
                        selectedFile={selectedFile}
                        onFileSelect={setSelectedFile}
                        projectId={selectedProjectId}
                    />

                    <div className="workspace">

                        <CodeEditor
                            selectedFile={selectedFile}
                            file={files[selectedFile]}
                            files={files}
                            setFiles={setFiles}
                            setTerminalOutput={setTerminalOutput}
                        />

                        <Terminal
                            output={terminalOutput}
                            setOutput={setTerminalOutput}
                        />

                    </div>

                </>

            ) : (

                <div>
                    <h3>No projects available</h3>
                    <button onClick={createProject}>
                        Create your first project
                    </button>
                </div>

            )}

        </main>
    );
}

export default IDE;