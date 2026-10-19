const { spawn } = require("child_process");
const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");

const processes = new Map();
const EXECUTION_TIMEOUT = 3000;
const COMPILE_TIMEOUT = 10000;
const MAX_OUTPUT = 1024 * 1024;

function createProcess({ language, code, stdin = "" }) {
    if (typeof code !== "string") {
        throw new Error("Code must be a string.");
    }

    if (!["cpp", "java"].includes(language)) {
        throw new Error("Supported languages are C++ and Java.");
    }

    const id = crypto.randomUUID();
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "codeflow-"));
    const job = {
        id,
        language,
        status: "running",
        stdout: "",
        stderr: "",
        exitCode: null
    };

    processes.set(id, job);

    const sourceFile = language === "cpp" ? "main.cpp" : "Main.java";
    const sourcePath = path.join(dir, sourceFile);

    try {
        fs.writeFileSync(sourcePath, code);
    } catch (error) {
        job.status = "error";
        job.stderr = error.message;
        fs.rmSync(dir, { recursive: true, force: true });
        return job;
    }

    function runCommand(command, args, timeout, onClose) {
        let finished = false;
        let timer;
        let child;

        const finish = (callback) => {
            if (finished) return;
            finished = true;
            clearTimeout(timer);
            callback();
        };

        try {
            child = spawn(command, args, {
                cwd: dir,
                windowsHide: true,
                stdio: ["pipe", "pipe", "pipe"]
            });
        } catch (error) {
            finish(() => {
                job.status = "error";
                job.stderr += error.message;
                onClose();
            });
            return;
        }

        const appendOutput = (key, data) => {
            if (finished) return;

            const remaining =
                MAX_OUTPUT - Buffer.byteLength(job.stdout) -
                Buffer.byteLength(job.stderr);

            if (remaining <= 0 || data.length > remaining) {
                job.stderr += "\nOutput limit exceeded.";
                job.status = "error";
                child.kill();
                return;
            }

            job[key] += data.toString();
        };

        child.stdout.on("data", data => appendOutput("stdout", data));
        child.stderr.on("data", data => appendOutput("stderr", data));

        child.on("error", error => {
            finish(() => {
                job.status = "error";
                job.stderr += error.message;
                onClose();
            });
        });

        child.on("close", exitCode => {
            finish(() => {
                onClose(exitCode);
            });
        });

        timer = setTimeout(() => {
            if (finished) return;

            job.status = "timeout";
            job.stderr += "\nExecution timed out.";
            child.kill();
        }, timeout);

        child.stdin.on("error", () => {});
        child.stdin.end(timeout === COMPILE_TIMEOUT ? "" : stdin);
    }

    function cleanup() {
        fs.rmSync(dir, { recursive: true, force: true });
    }

    function execute() {
        const command = language === "cpp"
            ? path.join(dir, "main.exe")
            : "java";

        const args = language === "cpp"
            ? []
            : ["-cp", dir, "Main"];

        runCommand(command, args, EXECUTION_TIMEOUT, exitCode => {
            if (job.status !== "timeout" && job.status !== "error") {
                job.exitCode = exitCode;
                job.status = exitCode === 0 ? "completed" : "error";
            }

            cleanup();
        });
    }

    if (language === "cpp") {
        runCommand(
            "g++",
            ["-std=c++17", sourcePath, "-o", path.join(dir, "main.exe")],
            COMPILE_TIMEOUT,
            exitCode => {
                if (job.status === "timeout" || job.status === "error" || exitCode !== 0) {
                    if (job.status !== "timeout" && job.status !== "error") {
                        job.status = "error";
                        job.exitCode = exitCode;
                    }
                    cleanup();
                    return;
                }

                execute();
            }
        );
    } else {
        runCommand("javac", [sourcePath], COMPILE_TIMEOUT, exitCode => {
            if (job.status === "timeout" || job.status === "error" || exitCode !== 0) {
                if (job.status !== "timeout" && job.status !== "error") {
                    job.status = "error";
                    job.exitCode = exitCode;
                }
                cleanup();
                return;
            }

            execute();
        });
    }

    return job;
}

function getProcess(id) {
    return processes.get(id) || null;
}

module.exports = { createProcess, getProcess };