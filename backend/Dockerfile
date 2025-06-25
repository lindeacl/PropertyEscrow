FROM python:3.12-slim

WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create artifacts directory
RUN mkdir -p ./artifacts/contracts

# Expose port
EXPOSE 8000

# Run the application
CMD python -m uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
