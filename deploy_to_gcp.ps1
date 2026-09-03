# Agentic Cinema — One-Click Google Cloud Run Deployment Script

$PROJECT_ID="seismic-relic-447818-r2"
$REGION="us-central1"
$SERVICE_NAME="agentic-cinema"

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "[*] DEPLOYING AGENTIC CINEMA TO GOOGLE CLOUD RUN" -ForegroundColor Cyan
Write-Host "    Project ID: $PROJECT_ID | Region: $REGION" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

# 1. Set Active GCP Project
gcloud config set project $PROJECT_ID

# 2. Build Container Image on Google Cloud Build
Write-Host "`n[Step 1/2] Building Container Image on Google Cloud Build..." -ForegroundColor Yellow
gcloud builds submit --tag "gcr.io/$PROJECT_ID/${SERVICE_NAME}:latest" .

# 3. Deploy Container to Google Cloud Run
Write-Host "`n[Step 2/2] Deploying to Google Cloud Run..." -ForegroundColor Yellow
gcloud run deploy $SERVICE_NAME `
  --image "gcr.io/$PROJECT_ID/${SERVICE_NAME}:latest" `
  --platform managed `
  --region $REGION `
  --allow-unauthenticated `
  --set-env-vars USE_VERTEX_AI=true,GOOGLE_CLOUD_PROJECT=$PROJECT_ID,GCS_BUCKET_NAME=agentic-cinema-projects

Write-Host "`n============================================================" -ForegroundColor Green
Write-Host "[✓] GOOGLE CLOUD RUN DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
