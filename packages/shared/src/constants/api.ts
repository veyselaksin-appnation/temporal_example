export const API = {
  PORTS: {
    GATEWAY: 3000,
    TEXT2TEXT: 3001,
    WEB_SEARCH: 3002,
  },
  ENDPOINTS: {
    PROMPT: "/prompt",
    HEALTH: "/health",
  },
} as const;
