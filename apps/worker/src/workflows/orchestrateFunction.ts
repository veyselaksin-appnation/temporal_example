import { proxyActivities } from "@temporalio/workflow";
import type * as activities from "../activities";
import { defineSignal, setHandler } from "@temporalio/workflow";

const { callMicroservice } = proxyActivities<typeof activities>({
  startToCloseTimeout: "1 minute",
});

// Define signal
export const dummySignal = "dummySignal";
export const streamSignal = "streamSignal";

export async function orchestrateFunction(prompt: string) {
  try {
    const result = await callMicroservice(prompt);
    return result;
  } catch (error) {
    console.error("Error in workflow:", error);
    throw error;
  }
}
