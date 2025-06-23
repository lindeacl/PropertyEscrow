FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Poetry
RUN pip install poetry

# Copy poetry files (Railway builds from root, so use relative paths)
COPY pyproject.toml poetry.lock* ./

# Configure poetry and install dependencies
RUN poetry config virtualenvs.create false \
    && poetry install --only main --no-root --no-interaction --no-ansi

# Copy application code
COPY . .

# Create a non-root user
RUN useradd --create-home --shell /bin/bash app \
    && chown -R app:app /app
USER app

# Expose port
EXPOSE 8000

# Health check with curl instead of requests
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8000}/healthz || exit 1

# Run the application
CMD ["sh", "-c", "python -m uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
