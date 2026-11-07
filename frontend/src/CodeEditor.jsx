import React from "react";
import Editor from "@monaco-editor/react";
function CodeEditor(props) {
const [stdin, setStdin] = React.useState("");

if (!props.file) {
    return (
        <div className="panel">
            <h3>Code Editor</h3>
            <p>No file selected</p>
        </div>
    );
}

async function runCode() {

    props.setTerminalOutput(["Submitting code to backend..."]);

    try {

        // Submit code
        const response = await fetch("http://localhost:5000/api/executions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                language: props.file.language,
                code: props.file.content,
               stdin: stdin
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Request failed");
        }

        const processId = data.process.processId;

        props.setTerminalOutput([
            `Process ID: ${processId}`,
            "Status: READY"
        ]);

        
        while (true) {

            await new Promise(resolve => setTimeout(resolve, 500));

            const statusResponse = await fetch(
                `http://localhost:5000/api/processes/${processId}`
            );

            const statusData = await statusResponse.json();

            if (!statusResponse.ok) {
                throw new Error(statusData.error || "Status request failed");
            }

            const process = statusData.process;

           props.setTerminalOutput([
    `Process ID: ${processId}`,
    `Language: ${process.language}`,
    `Status: ${process.status}`,
    "",
    "Output:",
    process.stdout || "(No output)",
    "",
    "Errors:",
    process.stderr || "(No errors)",
    "",
    `Exit Code: ${process.exitCode ?? "Pending"}`
]);

            if (
                process.status === "COMPLETED" ||
                process.status === "FAILED"
            ) {
                break;
            }
        }

    } catch (error) {

        props.setTerminalOutput([
            `Error: ${error.message}`
        ]);

    }
}

return (
    <div className="panel">
        <h3>Code Editor</h3>
        <textarea
    placeholder="Enter program input here..."
    value={stdin}
    onChange={(e) => setStdin(e.target.value)}
    rows={4}
/>
        <button onClick={runCode}>
            Run
        </button>

        <p>Selected file: {props.selectedFile}</p>

        <Editor
            height="400px"
            language={props.file.language}
            value={props.file.content}
            onChange={(value) => props.setFiles({
                ...props.files,
                [props.selectedFile]: {
                    ...props.file,
                    content: value
                }
            })}
        />

        <p>Language: {props.file.language}</p>
        <p>Code: {props.file.content}</p>
    </div>
);


}

export default CodeEditor;
