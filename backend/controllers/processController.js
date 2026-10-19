const { createProcess, getProcess } = require("../services/processService");

function submitProcess(req, res) {
    try {
        const { language, code, stdin } = req.body;

        if (!language || typeof code !== "string") {
            return res.status(400).json({ error: "Language and code are required." });
        }

        res.status(201).json(createProcess({ language, code, stdin }));
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

function fetchProcess(req, res) {
    const process = getProcess(req.params.id);
    if (!process) return res.status(404).json({ error: "Process not found." });
    res.json(process);
}

module.exports = { submitProcess, fetchProcess };