# Base image
FROM oven/bun:1.2-slim AS base

# Set working directory
WORKDIR /app

# Install dependencies and cache them
COPY package.json bun.lock ./
RUN bun install

# Copy source code
COPY . .

# Build Remix application
RUN bun run build

# Production image
FROM oven/bun:1.2-slim AS production

# Set working directory
WORKDIR /app

# Copy only necessary files from the build stage
COPY --from=base /app/build ./build
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/public ./public

# Expose the default Remix port
EXPOSE 3000

# Start the Remix server
CMD ["bun", "run", "start"]