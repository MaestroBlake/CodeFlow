const { spawn } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

async function executeCpp(code, stdin = "") {
    const tempDir = fs.mkdtempSync(
        path.join(os.tmpdir(), "codeflow-")
    );

    const sourcePath = path.join(tempDir, "main.cpp");

    fs.writeFileSync(sourcePath, code);

    return new Promise((resolve, reject) => {
        const docker = spawn("docker", [
            "run",
            "--rm",
            "-i",

            "--network", "none",
            "--memory", "128m",
            "--cpus", "0.5",
            "--pids-limit", "64",
            "--read-only",

            "--tmpfs", "/tmp:rw,nosuid,size=64m,exec",

            "--mount",
            `type=bind,source=${sourcePath},target=/workspace/main.cpp,readonly`,

            "--user", "1000:1000",
            "--security-opt", "no-new-privileges",
            "--cap-drop", "ALL",
            "--ulimit", "cpu=5:5",

            "gcc:latest",
            "sh",
            "-c",
            "g++ /workspace/main.cpp -o /tmp/program && timeout 5s /tmp/program"
        ]);

        let stdout = "";
        let stderr = "";
        let settled = false;

        const timer = setTimeout(() => {
            docker.kill();

            finish({
                stdout,
                stderr: stderr + "\nExecution timed out",
                exitCode: 124
            });
        }, 10000);

        function finish(result) {
            if (settled) return;

            settled = true;
            clearTimeout(timer);

            try {
                fs.rmSync(tempDir, { recursive: true, force: true });
            } catch (error) {
                console.error("Temporary file cleanup failed:", error);
            }

            resolve(result);
        }

        docker.stdout.on("data", data => {
            stdout += data.toString();
        });

        docker.stderr.on("data", data => {
            stderr += data.toString();
        });

        docker.on("error", error => {
            if (settled) return;

            settled = true;
            clearTimeout(timer);

            fs.rmSync(tempDir, { recursive: true, force: true });

            reject(error);
        });

        docker.on("close", code => {
            finish({
                stdout,
                stderr,
                exitCode: code
            });
        });

        docker.stdin.end(stdin);
    });
}
async function executePython(code, stdin = "") {
    const tempDir = fs.mkdtempSync(
        path.join(os.tmpdir(), "codeflow-")
    );

    const sourcePath = path.join(tempDir, "main.py");

    fs.writeFileSync(sourcePath, code);

    return new Promise((resolve, reject) => {
        const docker = spawn("docker", [
            "run",
            "--rm",
            "-i",

            "--network", "none",
            "--memory", "128m",
            "--cpus", "0.5",
            "--pids-limit", "64",
            "--read-only",

            "--tmpfs", "/tmp:rw,nosuid,size=64m,exec",

            "--mount",
            `type=bind,source=${sourcePath},target=/workspace/main.py,readonly`,

            "--user", "1000:1000",
            "--security-opt", "no-new-privileges",
            "--cap-drop", "ALL",
            "--ulimit", "cpu=5:5",

            "python:3.12-slim",
            "python",
            "/workspace/main.py"
        ]);

        let stdout = "";
        let stderr = "";
        let settled = false;

        const timer = setTimeout(() => {
            docker.kill();

            finish({
                stdout,
                stderr: stderr + "\nExecution timed out",
                exitCode: 124
            });
        }, 10000);

        function finish(result) {
            if (settled) return;

            settled = true;
            clearTimeout(timer);

            try {
                fs.rmSync(tempDir, { recursive: true, force: true });
            } catch (error) {
                console.error("Temporary file cleanup failed:", error);
            }

            resolve(result);
        }

        docker.stdout.on("data", data => {
            stdout += data.toString();
        });

        docker.stderr.on("data", data => {
            stderr += data.toString();
        });

        docker.on("error", error => {
            if (settled) return;

            settled = true;
            clearTimeout(timer);

            fs.rmSync(tempDir, { recursive: true, force: true });

            reject(error);
        });

        docker.on("close", code => {
            finish({
                stdout,
                stderr,
                exitCode: code
            });
        });

        docker.stdin.end(stdin);
    });
}
module.exports = {
    executeCpp,
    executePython
};