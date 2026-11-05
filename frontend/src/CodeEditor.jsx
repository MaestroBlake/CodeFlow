import Editor from "@monaco-editor/react";

function CodeEditor(props) {


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
        const response = await fetch("http://localhost:5000/api/executions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                language: props.file.language,
                code: props.file.content,
                stdin: ""
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Request failed");
        }

        props.setTerminalOutput([
            "Process submitted successfully!",
            `Process ID: ${data.process.processId}`,
            `Language: ${data.process.language}`,
            `Status: ${data.process.status}`
        ]);

    } catch (error) {
        props.setTerminalOutput([
            `Error: ${error.message}`
        ]);
    }
}

return (
    <div className="panel">
        <h3>Code Editor</h3>

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
