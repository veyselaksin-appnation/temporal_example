FROM node:20

WORKDIR /app

# Install TypeScript globally
RUN yarn global add typescript

# Copy workspace files
COPY package.json yarn.lock ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/
COPY packages/shared/ ./packages/shared/

# Install dependencies
RUN yarn install

# Build shared package first
RUN yarn workspace @ai-orchestrator/shared build

# Copy API source code
COPY apps/api/ ./apps/api/

# Build the API
RUN yarn workspace @ai-orchestrator/api build

# Expose the port
EXPOSE 3000

# Start the application
CMD ["yarn", "workspace", "@ai-orchestrator/api", "start"]