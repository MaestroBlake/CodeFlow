require("dotenv").config();
const express=require("express");
const app=express();
const PORT=5000;
const {
    createProcess,
    getAllProcesses,
    getProcessById
} = require("./services/processManager");
const cors = require("cors");
const { getQueue } = require("./services/scheduler");
const scheduler = require("./services/scheduler");
const { generateResponse } = require("./services/aiManager");
const {
    createProject,
    getProjectById,
    getAllProjects,
    updateProject,
    deleteProject,
    saveFile,
    getProjectFiles,
    getFile,
    deleteFile
} = require("./services/projectManager");
console.log("Scheduler exports:", Object.keys(scheduler));
console.log("Dispatch type:", typeof scheduler.dispatchNextProcess);
app.use(cors({
    origin: "http://localhost:5173"
}));
app.use(express.json());
app.post("/api/ai/suggest", async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({
                error: "Prompt is required"
            });
        }

        const result = await generateResponse(prompt);

        res.json({
            success: true,
            response: result
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
app.get("/api/processes", (req, res) => {
    const processes = getAllProcesses();

    res.json({
        totalProcesses: processes.length,
        processes
    });
});

app.get("/api/processes/:id", (req, res) => {

    const process = getProcessById(req.params.id);

    if (!process) {
        return res.status(404).json({
            error: "Process not found"
        });
    }

    res.json({
        process
    });

});
app.get("/api/queue", (req, res) => {
    res.json({
        queueSize: getQueue().length,
        processes: getQueue()
    });
});

app.post("/api/projects", async (req, res) => {
    try {
        const { projectName } = req.body;

        const project = await createProject(projectName);

        res.status(201).json({
            message: "Project created successfully",
            project
        });

    } catch (error) {
        res.status(400).json({
            error: error.message
        });
    }
});
app.get("/api/projects", async (req, res) => {
    try {
        const projects = await getAllProjects();

        res.json({
            totalProjects: projects.length,
            projects
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});
// ================= PROJECT ROUTES =================

// Create project
app.post("/api/projects", async (req, res) => {
    try {
        const { projectName } = req.body;

        const project = await createProject(projectName);

        res.status(201).json({
            message: "Project created successfully",
            project
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get all projects
app.get("/api/projects", async (req, res) => {
    try {
        const projects = await getAllProjects();

        res.json({
            totalProjects: projects.length,
            projects
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get project by ID
app.get("/api/projects/:id", async (req, res) => {
    try {
        const project = await getProjectById(req.params.id);

        if (!project) {
            return res.status(404).json({ error: "Project not found" });
        }

        res.json(project);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update project name
app.put("/api/projects/:id", async (req, res) => {
    try {
        const { projectName } = req.body;

        const project = await updateProject(req.params.id, projectName);

        if (!project) {
            return res.status(404).json({ error: "Project not found" });
        }

        res.json({
            message: "Project updated successfully",
            project
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete project
app.delete("/api/projects/:id", async (req, res) => {
    try {
        const project = await deleteProject(req.params.id);

        if (!project) {
            return res.status(404).json({ error: "Project not found" });
        }

        res.json({
            message: "Project deleted successfully",
            project
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// ================= FILE ROUTES =================

// Create or update file
app.post("/api/projects/:id/files", async (req, res) => {
    try {
        const { filename, language, content } = req.body;
        const projectId = req.params.id;

        if (!filename || !language || content === undefined) {
            return res.status(400).json({
                error: "Filename, language and content are required"
            });
        }

        const project = await getProjectById(projectId);

        if (!project) {
            return res.status(404).json({ error: "Project not found" });
        }

        const file = await saveFile(
            projectId,
            filename,
            language,
            content
        );

        res.status(201).json({
            message: "File saved successfully",
            file
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all files in a project
app.get("/api/projects/:id/files", async (req, res) => {
    try {
        const files = await getProjectFiles(req.params.id);

        res.json({
            totalFiles: files.length,
            files
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a specific file
app.get("/api/projects/:id/files/:filename", async (req, res) => {
    try {
        const file = await getFile(
            req.params.id,
            req.params.filename
        );

        if (!file) {
            return res.status(404).json({ error: "File not found" });
        }

        res.json(file);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a file
app.delete("/api/projects/:id/files/:filename", async (req, res) => {
    try {
        const file = await deleteFile(
            req.params.id,
            req.params.filename
        );

        if (!file) {
            return res.status(404).json({ error: "File not found" });
        }

        res.json({
            message: "File deleted successfully",
            file
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.get("/api/health",(req,res)=>{
    res.json({
        status:"OK",
        message:"CodeFlow backend is healthy"
    });
});
app.post("/api/executions", (req, res) => {
    try {
        const { language, code, stdin } = req.body;

        const process = createProcess({
            language,
            code,
            stdin
        });

        res.status(202).json({
            message: "Process created successfully",
            process
        });

    } catch (error) {
        res.status(400).json({
            error: error.message
        });
    }
});

app.listen(PORT,()=>{
    console.log(`CodeFlow backend running on port ${PORT}`);
})
