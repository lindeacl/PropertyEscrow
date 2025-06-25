FROM node:18-alpine

WORKDIR /app

# Copy frontend package files
COPY frontend/package*.json ./
RUN npm install

# Copy frontend source files
COPY frontend/ ./

# Build the React application
RUN npm run build

# Expose port 3000
EXPOSE 3000

# Start the Express server
CMD ["npm", "start"]
