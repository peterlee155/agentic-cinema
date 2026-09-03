#!/bin/bash
# 🚀 1-Click Deploy AgentPulse to Google Cloud Run

PROJECT_ID=$(gcloud config get-value project)
SERVICE_NAME="agentpulse-radar"
REGION="us-central1"

echo "============================================================"
echo "🚀 Deploying AgentPulse to Google Cloud Run"
echo "Project: ${PROJECT_ID}"
echo "Service: ${SERVICE_NAME}"
echo "Region:  ${REGION}"
echo "============================================================"

# Build and deploy directly via Google Cloud Build & Cloud Run
gcloud run deploy ${SERVICE_NAME} \
    --source . \
    --region ${REGION} \
    --allow-unauthenticated \
    --set-env-vars="GEMINI_API_KEY=${GEMINI_API_KEY}" \
    --min-instances=0 \
    --max-instances=5 \
    --memory=1Gi \
    --cpu=1

echo "✅ Deployment complete! Check Cloud Run console for the live URL."
