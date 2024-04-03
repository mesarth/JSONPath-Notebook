import { parentPort, workerData } from 'worker_threads';
import { JSONPathEnvironment } from "json-p3";

const useExtendedSyntax = workerData?.useExtendedSyntax ?? false;
const env = new JSONPathEnvironment({ strict: !useExtendedSyntax });
const result = env.query(workerData.expression, workerData.input);
parentPort.postMessage(result.values());
process.exit();
