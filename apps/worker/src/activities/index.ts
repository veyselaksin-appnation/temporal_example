import axios from "axios";

interface FunctionCall {
  function: string;
  arguments: Record<string, any>;
}

export async function callMicroservice(
  functionCall: FunctionCall
): Promise<any> {
  const { function: functionName, arguments: args } = functionCall;

  // Map function names to service URLs
  const serviceUrls = {
    text2text: "http://text2text:3001/process",
    web_search: "http://web_search:3002/search",
  };

  const serviceUrl = serviceUrls[functionName as keyof typeof serviceUrls];
  if (!serviceUrl) {
    throw new Error(`Unknown function: ${functionName}`);
  }

  try {
    let requestBody = args;

    // Format request body based on service
    if (functionName === "web_search") {
      requestBody = { query: args.input };
    } else if (functionName === "text2text") {
      requestBody = { input: args.input };
    }

    const response = await axios.post(serviceUrl, requestBody);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Microservice call failed: ${error.message}`);
    }
    throw error;
  }
}
