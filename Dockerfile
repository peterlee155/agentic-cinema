# ==============================================================================
# AGENTIC CINEMA STUDIO — FLEXIBLE PRODUCTION CONTAINER
# Target: Flexible Architecture with Complete Project Summary & Gemini 3.5+ Engine
# Supports Google Cloud Run, AWS ECS, Azure App Service, and Localhost
# ==============================================================================

FROM python:3.11-slim

WORKDIR /app

# Environment Settings
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8080 \
    PROJECT_INSTANCE_NAME="FlexibleStudio" \
    GCS_BUCKET_NAME="agentic-cinema-projects" \
    GOOGLE_CLOUD_PROJECT="seismic-relic-447818-r2"

# Install System Utilities
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install Python Requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy Full Project Files (including all 9 film projects in data/projects)
COPY . .

# Ensure Data & Asset Directories Exist
RUN mkdir -p /app/data/projects /app/static/generated

# Expose Dynamic Application Port
EXPOSE 8080

# Healthcheck Probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:${PORT:-8080}/api/health || exit 1

# Start Application via Dynamic Port Launcher
CMD ["python", "run.py"]
