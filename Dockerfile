# Agentic Cinema Studio - Bro Studio Container Instance
FROM python:3.11-slim

WORKDIR /app

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=9005 \
    PROJECT_INSTANCE_NAME="BroStudio" \
    GCS_BUCKET_NAME="agentic-cinema-projects-bro"

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p /app/data/projects_bro

EXPOSE 9005

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:9005/api/health || exit 1

CMD ["python", "run.py"]
