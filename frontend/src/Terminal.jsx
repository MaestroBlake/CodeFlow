function Terminal() {
    return (
        <div className="panel terminal">
            <div className="terminal-header">
                <h3>Terminal</h3>
                <button>Clear</button>
            </div>

            <div className="terminal-output">
                <p>Welcome to CodeFlow Terminal</p>
                <p>Output will appear here...</p>
            </div>
        </div>
    )
}

export default Terminal