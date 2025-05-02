FROM node:20

WORKDIR /app

# Install TypeScript globally
RUN yarn global add typescript

# Copy root package.json
COPY package.json ./

# Copy workspace package.json
COPY apps/microservices/text2text/package.json ./apps/microservices/text2text/

# Install dependencies
RUN yarn install

# Copy source code
COPY . .

# Build the application
RUN yarn workspace @ai-orchestrator/text2text build

# Expose the port
EXPOSE 3001

# Start the service
CMD ["yarn", "workspace", "@ai-orchestrator/text2text", "start"] 