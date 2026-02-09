# Use Playwright's official image with browsers pre-installed
FROM mcr.microsoft.com/playwright:v1.41.0-jammy

WORKDIR /app

# Copy package files
COPY package*.json ./

# Native build deps for better-sqlite3 (ensure available)
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

# Install dependencies
RUN npm install --production=false

# Copy source
COPY . .

# Build TypeScript
RUN npm run build

# Install only chromium (smaller image)
RUN npx playwright install chromium

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "dist/index.js"]
