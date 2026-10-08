import {useState} from "react";
function FileExplorer(props) {
    const[newFileName,setNewFileName]=useState("");
 function getLanguage(fileName){   if(fileName.endsWith(".cpp")){
        return "cpp"
    }
    if(fileName.endsWith(".py")){
        return "python"
    }
    if(fileName.endsWith(".java")){
        return "java"
    }
    if(fileName.endsWith(".js")|| fileName.endsWith(".jsx")){
        return "javascript"
    }
    if(fileName.endsWith(".ts")|| fileName.endsWith(".tsx")){
        return "typescript"
    }
    return "plaintext"
}
    function deleteFile(){
        console.log("Deleting",props.selectedFile)
        const newFiles={...props.files}
        delete newFiles[props.selectedFile]
        const remainingFiles=Object.keys(newFiles)
        if(remainingFiles.length>0){
            props.onFileSelect(remainingFiles[0])
        }
        else{
            props.onFileSelect(null)
        }
        props.setFiles(newFiles)
    }
    function createFile(){
        if(props.files[newFileName]){
            return
        }
       props.setFiles({
        ...props.files,
        [newFileName]:{
            language:getLanguage(newFileName),
            content:""
        }
       })
       props.onFileSelect(newFileName)
    }
    return (
        <div className="panel">
            <h3>Files</h3>
            <input placeholder="New file name"
            value={newFileName}
            onChange={(event)=>setNewFileName(event.target.value)}
            />
            <button
                onClick={createFile}>
                Create File</button>
                <button onClick={deleteFile}>
                    Delete File
                </button>
            <p>src</p>
          {Object.keys(props.files).map((fileName)=>(
            <p
            key={fileName} 
            onClick={()=>props.onFileSelect(fileName)}>
                {fileName}
            </p>
          ))}
        </div>
    )
}

 export default FileExplorer;