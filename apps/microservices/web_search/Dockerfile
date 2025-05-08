FROM node:20-alpine

WORKDIR /app

# Copy workspace files
COPY package.json yarn.lock ./
COPY apps/microservices/web_search/package.json ./apps/microservices/web_search/
COPY packages/openai-client/package.json ./packages/openai-client/
COPY packages/shared/package.json ./packages/shared/

# Copy required packages
COPY packages/openai-client/ ./packages/openai-client/
COPY packages/shared/ ./packages/shared/

# Install dependencies
RUN yarn install

# Build shared packages first
RUN yarn workspace @ai-orchestrator/shared build
RUN yarn workspace @ai-orchestrator/openai-client build

# Copy service source code
COPY apps/microservices/web_search/ ./apps/microservices/web_search/

# Build the service
RUN yarn workspace @ai-orchestrator/web-search build

# Expose the port
EXPOSE 3002

# Start the application
CMD ["yarn", "workspace", "@ai-orchestrator/web-search", "start"]