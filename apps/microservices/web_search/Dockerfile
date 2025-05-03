FROM node:20-alpine

WORKDIR /app

# Copy root package.json and yarn.lock
COPY package.json yarn.lock ./

# Copy workspace package.json files
COPY apps/microservices/web_search/package.json ./apps/microservices/web_search/
COPY packages/openai-client/package.json ./packages/openai-client/

# Install dependencies
RUN yarn install

# Copy source code
COPY . .

# Build the application
RUN yarn workspace @ai-orchestrator/web-search build

# Expose the port
EXPOSE 3002

# Start the application
CMD ["yarn", "workspace", "@ai-orchestrator/web-search", "start"] 