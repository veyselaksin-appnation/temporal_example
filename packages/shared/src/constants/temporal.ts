export const TEMPORAL = {
  NAMESPACE: "ai-orchestrator",
  ADDRESS: process.env.TEMPORAL_ADDRESS || "temporal:7233",
  TASK_QUEUES: {
    DEFAULT: "ai-orchestrator",
    TEXT_TO_TEXT: "text2text-queue",
    WEB_SEARCH: "web-search-queue",
  },
} as const;
