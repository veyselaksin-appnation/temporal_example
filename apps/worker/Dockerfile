FROM node:20

WORKDIR /app

# Install build essentials for native modules
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy root package.json and yarn.lock
COPY package.json yarn.lock ./

# Copy workspace package.json
COPY apps/worker/package.json ./apps/worker/

# Install dependencies
RUN yarn install --frozen-lockfile --network-timeout 1000000

# Copy source code
COPY . .

# Build the application
RUN yarn workspace @ai-orchestrator/worker build

# Start the worker
CMD ["yarn", "workspace", "@ai-orchestrator/worker", "start"] 