FROM node:20-slim as builder

RUN npm install -g pnpm tsx

WORKDIR /app

# Copy package.json and package-lock.json (if it exists)
COPY package*.json ./

# Install dependencies
RUN pnpm install

# Copy the rest of the application
COPY . .

# Build the application
RUN pnpm build

# Expose the port specified in the .env file (default is 3000)
EXPOSE 3000

# Command to run the application
CMD ["pnpm", "dev"] 