import { proxyActivities } from "@temporalio/workflow";
import type * as activities from "../activities";

interface FunctionCall {
  function: string;
  arguments: Record<string, any>;
}

const { callMicroservice } = proxyActivities<typeof activities>({
  startToCloseTimeout: "1 minute",
});

export async function orchestrateFunction(
  functionCall: FunctionCall
): Promise<any> {
  return callMicroservice(functionCall);
}
