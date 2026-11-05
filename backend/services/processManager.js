const processes=[];
let nextProcessId=1;
const {addToQueue}=require("./scheduler");
function createProcess({language,code,stdin=""}){
    const process={
        processId: nextProcessId++,
        language,
        code,
        stdin,
        status:"READY",
        createdAt:new Date()
    };
    processes.push(process);
    addToQueue(process);
    return process;
}
function getAllProcesses() {
    return processes;
}
module.exports={
    createProcess,
    getAllProcesses
};