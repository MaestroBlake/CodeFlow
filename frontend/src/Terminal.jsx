function Terminal(props) {
    return (
        <div className="panel terminal">
            <div className="terminal-header">
                <h3>Terminal</h3>
                <button>Clear</button>
            </div>

            <div className="terminal-output">
                {props.output.map((line,index)=>(
                    <p key={index}>{line}</p>
                ))}
            </div>
        </div>
    )
}

export default Terminal