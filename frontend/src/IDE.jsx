import CodeEditor from "./CodeEditor";
import FileExplorer from "./FileExplorer";
import Terminal from "./Terminal";
import { useState } from "react";
function IDE(){
    const [selectedFile,setSelectedFile]=useState("App.jsx");
    return (
        <main>
           
            <FileExplorer onFileSelect={setSelectedFile}/>
            <CodeEditor selectedFile={selectedFile} />
            <Terminal/>
                
              
        </main>
    )
}
export default IDE;