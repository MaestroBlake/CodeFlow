import { useState } from "react";

const API = "http://localhost:5000";

function FileExplorer(props) {

    const [newFileName, setNewFileName] = useState("");
    const [renameFileName, setRenameFileName] = useState("");

    function getLanguage(fileName) {

        if (fileName.endsWith(".cpp")) return "cpp";
        if (fileName.endsWith(".py")) return "python";
        if (fileName.endsWith(".java")) return "java";

        if (
            fileName.endsWith(".js") ||
            fileName.endsWith(".jsx")
        ) return "javascript";

        if (
            fileName.endsWith(".ts") ||
            fileName.endsWith(".tsx")
        ) return "typescript";

        return "plaintext";
    }

    // Create file
    async function createFile() {

        const filename = newFileName.trim();

        if (!filename || props.files[filename]) return;

        try {

            const language = getLanguage(filename);

            const response = await fetch(
                `${API}/api/projects/${props.projectId}/files`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        filename,
                        language,
                        content: ""
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error);
            }

            props.setFiles(prev => ({
                ...prev,
                [filename]: {
                    language,
                    content: ""
                }
            }));

            props.onFileSelect(filename);

            setNewFileName("");

        } catch (error) {
            alert(error.message);
        }
    }

    // Delete file
    async function deleteFile() {

        const filename = props.selectedFile;

        if (!filename) return;

        try {

            const response = await fetch(
                `${API}/api/projects/${props.projectId}/files/${encodeURIComponent(filename)}`,
                {
                    method: "DELETE"
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error);
            }

            const newFiles = { ...props.files };

            delete newFiles[filename];

            props.setFiles(newFiles);

            const remainingFiles = Object.keys(newFiles);

            props.onFileSelect(
                remainingFiles.length > 0
                    ? remainingFiles[0]
                    : null
            );

        } catch (error) {
            alert(error.message);
        }
    }

    // Rename file
    async function renameFile() {

        const oldName = props.selectedFile;
        const newName = renameFileName.trim();

        if (!oldName || !newName) return;

        if (oldName === newName) return;

        if (props.files[newName]) {
            alert("A file with this name already exists.");
            return;
        }

        try {

            const oldFile = props.files[oldName];

            const response = await fetch(
                `${API}/api/projects/${props.projectId}/files`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        filename: newName,
                        language: getLanguage(newName),
                        content: oldFile.content
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error);
            }

            const deleteResponse = await fetch(
                `${API}/api/projects/${props.projectId}/files/${encodeURIComponent(oldName)}`,
                {
                    method: "DELETE"
                }
            );

            if (!deleteResponse.ok) {
                throw new Error("Could not delete the old file.");
            }

            const newFiles = { ...props.files };

            delete newFiles[oldName];

            newFiles[newName] = {
                language: getLanguage(newName),
                content: oldFile.content
            };

            props.setFiles(newFiles);

            props.onFileSelect(newName);

            setRenameFileName("");

        } catch (error) {
            alert(error.message);
        }
    }

    return (

        <div className="panel">

            <h3>Files</h3>

            <input
                placeholder="New file name"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
            />

            <button onClick={createFile}>
                Create File
            </button>

            <hr />

            <input
                placeholder="Rename filename"
                value={renameFileName}
                onChange={(e) => setRenameFileName(e.target.value)}
            />

            <button onClick={renameFile}>
                Rename File
            </button>

            <button onClick={deleteFile}>
                Delete File
            </button>

            <hr />

            <p>src</p>

            {Object.keys(props.files).map(fileName => (

                <p
                    key={fileName}
                    onClick={() => props.onFileSelect(fileName)}
                    style={{
                        cursor: "pointer",
                        fontWeight:
                            props.selectedFile === fileName
                                ? "bold"
                                : "normal"
                    }}
                >
                    {fileName}
                </p>

            ))}

        </div>
    );
}

export default FileExplorer;