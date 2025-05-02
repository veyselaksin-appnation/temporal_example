FROM node:20

WORKDIR /app

# Install TypeScript globally
RUN yarn global add typescript

# Copy root package.json
COPY package.json ./

# Copy workspace package.json
COPY apps/microservices/web_search/package.json ./apps/microservices/web_search/

# Install dependencies
RUN yarn install

# Copy source code
COPY . .

# Build the application
RUN yarn workspace @ai-orchestrator/web-search build

# Expose the port
EXPOSE 3002

# Start the service
CMD ["yarn", "workspace", "@ai-orchestrator/web-search", "start"] 