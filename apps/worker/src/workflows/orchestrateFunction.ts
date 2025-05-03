import { proxyActivities } from "@temporalio/workflow";
import type * as activities from "../activities";

const { callMicroservice } = proxyActivities<typeof activities>({
  startToCloseTimeout: "10 seconds",
  retry: {
    maximumAttempts: 3,
  },
});

export async function orchestrateFunction(functionCall: any): Promise<any> {
  try {
    const result = await callMicroservice(functionCall);
    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Workflow failed with unknown error");
  }
}
