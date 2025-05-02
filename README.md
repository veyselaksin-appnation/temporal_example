# AI Orchestrator

A scalable, maintainable backend architecture using Temporal, Fastify, TypeScript, and Docker, following a microservice-based monorepo design.

## Architecture

The project consists of the following components:

- **API Gateway**: Fastify service that accepts user prompts and coordinates with Temporal
- **Temporal Worker**: Handles workflow orchestration and microservice communication
- **Microservices**:
  - text2text: Processes text input and returns modified text
  - web_search: Performs mock web searches and returns results

## Prerequisites

- Docker and Docker Compose
- Node.js 18 or later
- Yarn

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   yarn install
   ```
3. Start the services:
   ```bash
   yarn dev
   ```

## API Endpoints

### POST /prompt

Accepts a prompt and returns the processed result.

Example request:

```json
{
  "prompt": "Tell me a joke"
}
```

Example response:

```json
{
  "result": "Why did the AI go to school? To get more artificial intelligence!"
}
```

## Service Ports

- API Gateway: 3000
- Text2Text Service: 3001
- Web Search Service: 3002
- Temporal Server: 7233

## Development

To run the services in development mode:

```bash
# Install dependencies
yarn install

# Start services
yarn dev
```

## Project Structure

```
/ai-orchestrator
├── apps/
│   ├── api/                     # Public API Gateway
│   ├── worker/                  # Temporal Worker
│   └── microservices/
│       ├── text2text/          # Text processing service
│       └── web_search/         # Web search service
├── packages/
│   └── shared/                 # Shared types and interfaces
├── docker-compose.yml
└── README.md
```

## License

MIT
