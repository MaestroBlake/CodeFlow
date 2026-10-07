import Editor from "@monaco-editor/react"
function CodeEditor(props) {

    return (
        <div className="panel">
            <h3>Code Editor</h3>
            <p>Selected file:{props.selectedFile}</p>
            <Editor 
            height="400px"
            language={props.file.language}
            value={props.file.content}
            onChange={(value)=>props.setFiles({
                ...props.files,
                [props.selectedFile]:{
                    ...props.file,
                    content:value
                }
            })}
            />
            <p>Language:{props.file.language}</p>
            <p>Code:{props.file.content}</p>
            
        </div>
    )
}

export default CodeEditor;