FROM node:18-alpine

# Install findutils to make 'find\' command available
RUN apk add --no-cache findutils

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY ../shared/package*.json ../shared/

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .
COPY ../shared ../shared

# Build the application
RUN npm run build

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S gateway -u 1001

# Change ownership
RUN chown -R gateway:nodejs /app
USER gateway

EXPOSE 3000

CMD ["npm", "start"]