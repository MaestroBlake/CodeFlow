const { executeProcess } = require("./executionManager");
const readyQueue = [];
console.log("Execution Manager exports:", Object.keys(require("./executionManager")));
console.log("executeProcess type:", typeof executeProcess);
function addToQueue(process) {
    readyQueue.push(process);

    console.log(`Process ${process.processId} added to Ready Queue`);
}
async function dispatchNextProcess() {

    if (readyQueue.length === 0) {
        console.log("No processes waiting in Ready Queue");
        return null;
    }

    const process = readyQueue.shift();

    console.log(`Dispatching Process ${process.processId}`);

    const result = await executeProcess(process);

    return result;
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
    dispatchNextProcess
};