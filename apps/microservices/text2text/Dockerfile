FROM node:20-alpine

WORKDIR /app

# Copy workspace files
COPY package.json yarn.lock ./
COPY apps/microservices/text2text/package.json ./apps/microservices/text2text/
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
COPY apps/microservices/text2text/ ./apps/microservices/text2text/

# Build the service
RUN yarn workspace @ai-orchestrator/text2text build

# Expose the port
EXPOSE 3001

# Start the application
CMD ["yarn", "workspace", "@ai-orchestrator/text2text", "start"]