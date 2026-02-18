# Campaign Chatbot Dockerfile
# This creates a containerized environment for the Node.js chatbot server

# Start with official Node.js LTS (Long Term Support) image
# Alpine variant is smaller and more secure
FROM node:18-alpine

# Set working directory in container
WORKDIR /app

# Copy package files first (Docker caching optimization)
# If package.json hasn't changed, Docker will reuse the cached layer
COPY package*.json ./

# Install dependencies
# --production flag skips devDependencies in production
RUN npm install --production

# Copy application code
COPY index.js ./

# Create directory for campaign data
# This will be mounted as a volume from the host
RUN mkdir -p /app/data

# Expose the port the app runs on
EXPOSE 3001

# Add healthcheck to ensure container is running properly
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1); })"

# Run the application
CMD ["node", "index.js"]
