# Use Node 20 base image
FROM node:20-slim

# Set working directory inside container
WORKDIR /app

# Copy lock files and install dependencies
COPY package*.json ./
RUN npm install

# Copy application files
COPY . .

# Run compilation
RUN npm run build

# Expose port and run server
EXPOSE 3000
CMD ["npm", "run", "start"]
