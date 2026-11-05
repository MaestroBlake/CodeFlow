import CodeEditor from "./CodeEditor";
import FileExplorer from "./FileExplorer";
import Terminal from "./Terminal";
import { useState } from "react";
function IDE(){
    const [files,setFiles]=useState({
        "App.jsx":{
            language:"javascript",
            content:"//Appcode"
        },
        "Header.jsx":{
            language:"typescript",
            content:"//Header code"
        },
        "IDE.jsx":{
            language:"python",
            content:"//IDE code"
        }
    })
    const handleRun = async () => {
    try {
        const response = await fetch("http://localhost:5000/api/executions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                language: "cpp",
                code: files[selectedFile].content,
                stdin: ""
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Execution request failed");
        }

        console.log("Backend response:", data);

        setTerminalOutput(prev => [
            ...prev,
            `Process ID: ${data.process.processId}`,
            `Status: ${data.process.status}`
        ]);

    } catch (error) {
        console.error(error);
        setTerminalOutput(prev => [
            ...prev,
            `Error: ${error.message}`
        ]);
    }
};
    const [selectedFile,setSelectedFile]=useState("App.jsx");
    const[terminalOutput,setTerminalOutput]=useState([]);
    return (
        <main>
           
            <FileExplorer onFileSelect={setSelectedFile}
            files={files}
            setFiles={setFiles}
            selectedFile={selectedFile}
            />
            <div className="workspace">
            <CodeEditor selectedFile={selectedFile}
            file={files[selectedFile]}
            files={files}
            setFiles={setFiles}
            setTerminalOutput={setTerminalOutput}
                onRun={handleRun} />
            
            <Terminal
            output={terminalOutput}
            setOutput={setTerminalOutput}/>
            </div>
          
        </main>
        
    )
    
}

export default IDE;