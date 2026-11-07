const { executeProcess } = require("./executionManager");
const readyQueue = [];
let isRunning=false;
console.log("Execution Manager exports:", Object.keys(require("./executionManager")));
console.log("executeProcess type:", typeof executeProcess);
function addToQueue(process) {
    readyQueue.push(process);

    console.log(`Process ${process.processId} added to Ready Queue`);

    startScheduler();
}
async function startScheduler() {

    if (isRunning) {
        return;
    }

    isRunning = true;

    while (readyQueue.length > 0) {

        const process = readyQueue.shift();

        console.log(`Dispatching Process ${process.processId}`);

        await executeProcess(process);

    }

    isRunning = false;

    console.log("Scheduler idle. No pending processes.");
}


function getNextProcess() {
    if (readyQueue.length === 0) {
        return null;
    }

    return readyQueue[0];
}

function getQueue() {
    return readyQueue;
}

module.exports = {
    addToQueue,
    getNextProcess,
    getQueue,
   
};