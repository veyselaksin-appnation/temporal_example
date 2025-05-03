import { Worker } from "@temporalio/worker";
import { NativeConnection } from "@temporalio/worker";
import * as activities from "./activities";
import path from "path";

async function run() {
  const connection = await NativeConnection.connect({
    address: process.env.TEMPORAL_ADDRESS || "temporal:7233",
  });

  const worker = await Worker.create({
    connection,
    workflowsPath: path.join(__dirname, "workflows/orchestrateFunction.js"),
    activities,
    taskQueue: "ai-orchestrator",
    enableSDKTracing: false,
  });

  console.log("Worker started, listening on task queue: ai-orchestrator");
  await worker.run();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
