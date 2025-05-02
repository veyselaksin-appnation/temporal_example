FROM node:20

WORKDIR /app

# Install TypeScript globally
RUN yarn global add typescript

# Copy root package.json
COPY package.json ./

# Copy workspace package.json
COPY apps/api/package.json ./apps/api/

# Install dependencies
RUN yarn install

# Copy source code
COPY . .

# Build the application
RUN yarn workspace @ai-orchestrator/api build

# Expose the port
EXPOSE 3000

# Start the application
CMD ["yarn", "workspace", "@ai-orchestrator/api", "start"] 