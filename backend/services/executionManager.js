const { executeCpp, executePython } = require("./dockerManager");
async function executeProcess(process) {

    console.log(`Executing Process ${process.processId}`);

    process.status = "RUNNING";

    try {

        let result;

      if (process.language === "cpp") {
    result = await executeCpp(process.code, process.stdin);
} 
else if (process.language === "python") {
    result = await executePython(process.code, process.stdin);
} 
else {
    throw new Error(`Unsupported language: ${process.language}`);
}

        process.stdout = result.stdout;
        process.stderr = result.stderr;
        process.exitCode = result.exitCode;

        if (result.exitCode === 0) {
            process.status = "COMPLETED";
        } else {
            process.status = "FAILED";
        }

        console.log(`Process ${process.processId}: ${process.status}`);

    } catch (error) {

        process.status = "FAILED";
        process.stderr = error.message;

        console.log(`Process ${process.processId} failed: ${error.message}`);

    }

    return process;
}

module.exports = {
    executeProcess
};