import { parentPort, workerData } from 'worker_threads';
import { jsonpath } from "json-p3";

const result = jsonpath.query(workerData.expression, workerData.input);
parentPort.postMessage(result.values());
process.exit();
