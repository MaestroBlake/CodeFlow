function FileExplorer(props) {
    return (
        <div className="panel">
            <h3>Files</h3>
            <p>📁 src</p>
            <p onClick={()=>props.onFileSelect("App.jsx")}>
                📄 App.jsx</p>
            <p onClick={()=>props.onFileSelect("Header.jsx")}>📄 Header.jsx</p>
            <p onClick={()=>props.onFileSelect("IDE.jsx")}>📄 IDE.jsx</p>
        </div>
    )
}
 export default FileExplorer;