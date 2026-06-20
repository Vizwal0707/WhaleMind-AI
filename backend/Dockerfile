# Use Python 3.11 base image
FROM python:3.11-slim

# Set working directory inside container
WORKDIR /app

# Install system dependencies for building PostgreSQL drivers
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source files
COPY . .

# Expose port and run uvicorn server
EXPOSE 8000
CMD ["python", "main.py"]
