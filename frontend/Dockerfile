FROM node:22-alpine

WORKDIR /app

# Copy package files first for optimal Docker caching
COPY package*.json ./

# Clean install dependencies
RUN npm install

# Copy source files
COPY . .

# Expose Vite dev port
EXPOSE 5173

# Start Vite with 0.0.0.0 host binding so it is accessible outside container
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
