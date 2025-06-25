FROM python:3.12-slim

WORKDIR /app

# Copy requirements and install dependencies in one layer to reduce memory usage
COPY pyproject.toml ./
RUN pip install --no-cache-dir fastapi[standard]==0.115.13 \
    psycopg[binary]==3.2.9 \
    mysql-connector-python==9.3.0 \
    sqlalchemy==2.0.41 \
    pymysql==1.1.1 \
    python-jose[cryptography]==3.5.0 \
    passlib[bcrypt]==1.7.4 \
    python-multipart==0.0.20 \
    web3==7.12.0 \
    python-dotenv==1.1.0 \
    psycopg2-binary==2.9.10 \
    uvicorn

# Copy application code
COPY . .

# Create artifacts directory for blockchain functionality
RUN mkdir -p ./artifacts/contracts

# Expose port
EXPOSE 8000

# Run the application with dynamic port for Railway
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "${PORT:-8000}"]
