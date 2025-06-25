FROM python:3.12-alpine

WORKDIR /app

# Install minimal system dependencies
RUN apk add --no-cache postgresql-dev

# Install Python dependencies with minimal memory usage
RUN pip install --no-cache-dir --no-deps \
    fastapi==0.115.13 \
    uvicorn==0.32.1 \
    psycopg==3.2.9 \
    sqlalchemy==2.0.41 \
    python-jose==3.5.0 \
    passlib==1.7.4 \
    python-multipart==0.0.20 \
    web3==7.12.0 \
    python-dotenv==1.1.0 \
    starlette==0.41.3 \
    pydantic==2.10.4 \
    typing-extensions==4.12.2

# Copy application code
COPY . .

# Create artifacts directory
RUN mkdir -p ./artifacts/contracts

# Expose port
EXPOSE 8000

# Run the application
CMD python -m uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
