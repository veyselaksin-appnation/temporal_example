export type ServiceType = "text2text" | "web_search";

interface Service {
  name: string;
  endpoint: string;
  description: string;
  type: ServiceType;
  options?: Record<string, any>;
}

export const SERVICES: Record<ServiceType, Service> = {
  text2text: {
    name: "text2text_service",
    description: "Converts text to text using a specific model",
    endpoint: "http://text2text:3001/process",
    type: "text2text",
  },
  web_search: {
    name: "web_search_service",
    description: "Searches the web and provides information based on the query",
    endpoint: "http://web_search:3002/search",
    type: "web_search",
  },
} as const;
