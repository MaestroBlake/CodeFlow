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
    const [selectedFile,setSelectedFile]=useState("App.jsx");
    
    return (
        <main>
           
            <FileExplorer onFileSelect={setSelectedFile}
            files={files}
            setFiles={setFiles}
            selectedFile={selectedFile}
            />
            <CodeEditor selectedFile={selectedFile}
            file={files[selectedFile]}
            files={files}
            setFiles={setFiles} />
            <Terminal/>
          
        </main>
        
    )
    
}

export default IDE;