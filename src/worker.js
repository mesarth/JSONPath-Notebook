import { parentPort, workerData } from 'worker_threads';
import jsonPath from './lib/jsonpath';

const result = jsonPath(workerData.input, workerData.expression);
parentPort.postMessage(result);
process.exit();
