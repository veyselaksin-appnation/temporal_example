FROM node:20

WORKDIR /app

# Install build essentials for native modules
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy workspace files
COPY package.json yarn.lock ./
COPY apps/worker/package.json ./apps/worker/
COPY packages/openai-client/package.json ./packages/openai-client/
COPY packages/shared/package.json ./packages/shared/

# Copy required packages
COPY packages/openai-client/ ./packages/openai-client/
COPY packages/shared/ ./packages/shared/

# Install dependencies
RUN yarn install --frozen-lockfile --network-timeout 1000000

# Build shared packages first
RUN yarn workspace @ai-orchestrator/shared build
RUN yarn workspace @ai-orchestrator/openai-client build

# Copy worker source code
COPY apps/worker/ ./apps/worker/

# Build the worker
RUN yarn workspace @ai-orchestrator/worker build

# Start the worker
CMD ["yarn", "workspace", "@ai-orchestrator/worker", "start"]