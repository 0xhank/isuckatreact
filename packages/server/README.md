# Server

This is the server component for the Four Boxes application.

## Running with Docker

### Prerequisites

-   Docker
-   Docker Compose

### Setup

1. Copy the environment example file and update it with your values:

```bash
cp .env.example .env
```

2. Edit the `.env` file to include your API keys and configuration:

```
PORT=3000
COMPOSIO_API_KEY=your_composio_api_key
OPENAI_API_KEY=your_openai_api_key
AUTH0_DOMAIN=your_auth0_domain
```

### Running with Docker Compose

To build and start the server:

```bash
docker-compose up --build
```

To run it in detached mode (in the background):

```bash
docker-compose up --build -d
```

To stop the server:

```bash
docker-compose down
```

### Without Docker Compose

If you prefer to use Docker directly:

1. Build the Docker image:

```bash
docker build -t four-boxes-server .
```

2. Run the container:

```bash
docker run -p 3000:3000 --env-file .env four-boxes-server
```

## Development

For local development without Docker:

```bash
npm install
npm run dev
```
