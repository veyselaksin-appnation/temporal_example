FROM node:20-alpine

WORKDIR /app

# Copy root package.json and yarn.lock
COPY package.json yarn.lock ./

# Copy workspace package.json files
COPY apps/microservices/text2text/package.json ./apps/microservices/text2text/
COPY packages/openai-client/package.json ./packages/openai-client/

# Install dependencies
RUN yarn install

# Copy source code
COPY . .

# Build the application
RUN yarn workspace @ai-orchestrator/text2text build

# Expose the port
EXPOSE 3001

# Start the application
CMD ["yarn", "workspace", "@ai-orchestrator/text2text", "start"] 