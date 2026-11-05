async function executeProcess(process) {

    console.log(`Executing Process ${process.processId}`);

    process.status = "RUNNING";

    try {

        
        await new Promise(resolve => setTimeout(resolve, 2000));

        process.status = "COMPLETED";

        console.log(`Process ${process.processId} completed`);

    } catch (error) {

        process.status = "FAILED";

        console.log(`Process ${process.processId} failed`);

    }

    return process;
}

module.exports = {
    executeProcess
};