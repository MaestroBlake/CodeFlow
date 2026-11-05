const express=require("express");
const app=express();
const PORT=5000;
const { createProcess, getAllProcesses } = require("./services/processManager");
const cors = require("cors");
const { dispatchNextProcess } = require("./services/scheduler");
const scheduler = require("./services/scheduler");
const { getQueue } = require("./services/scheduler");
console.log("Scheduler exports:", Object.keys(scheduler));
console.log("Dispatch type:", typeof scheduler.dispatchNextProcess);
app.use(cors({
    origin: "http://localhost:5173"
}));
app.use(express.json());
app.get("/api/processes", (req, res) => {
    const processes = getAllProcesses();

    res.json({
        totalProcesses: processes.length,
        processes
    });
});
app.get("/api/queue", (req, res) => {
    res.json({
        queueSize: getQueue().length,
        processes: getQueue()
    });
});
app.post("/api/dispatch", async (req, res) => {
    try {
        const process = await dispatchNextProcess();

        if (!process) {
            return res.status(404).json({
                message: "No processes waiting in Ready Queue"
            });
        }

        res.json({
            message: "Process execution finished",
            process
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
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
