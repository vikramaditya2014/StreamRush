# Firebase Storage CORS Setup Script for Windows
# This script configures Firebase Storage to work with localhost and deployment platforms

Write-Host "🔥 Firebase Storage CORS Setup" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Yellow

# Check if Google Cloud SDK is installed
$gcloudPath = Get-Command gcloud -ErrorAction SilentlyContinue
if (-not $gcloudPath) {
    Write-Host "❌ Google Cloud SDK not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Google Cloud SDK first:" -ForegroundColor Yellow
    Write-Host "1. Download from: https://cloud.google.com/sdk/docs/install-sdk" -ForegroundColor Cyan
    Write-Host "2. Run the installer and follow the setup wizard" -ForegroundColor Cyan
    Write-Host "3. Restart PowerShell and run this script again" -ForegroundColor Cyan
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✅ Google Cloud SDK found" -ForegroundColor Green

# Check if user is authenticated
$authCheck = gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>$null
if (-not $authCheck) {
    Write-Host "🔐 Authenticating with Google Cloud..." -ForegroundColor Yellow
    gcloud auth login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Authentication failed!" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

Write-Host "✅ Authenticated with Google Cloud" -ForegroundColor Green

# Set the project
Write-Host "🎯 Setting Firebase project..." -ForegroundColor Yellow
gcloud config set project vidstream-98e50
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to set project!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✅ Project set to vidstream-98e50" -ForegroundColor Green

# Check if cors.json exists
if (-not (Test-Path "cors.json")) {
    Write-Host "❌ cors.json file not found!" -ForegroundColor Red
    Write-Host "Make sure you're running this script from the project root directory." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Apply CORS configuration
Write-Host "🌐 Applying CORS configuration..." -ForegroundColor Yellow
gsutil cors set cors.json gs://vidstream-98e50.firebasestorage.app
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to apply CORS configuration!" -ForegroundColor Red
    Write-Host "Make sure you have the necessary permissions for the Firebase project." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✅ CORS configuration applied successfully!" -ForegroundColor Green

# Verify CORS configuration
Write-Host "🔍 Verifying CORS configuration..." -ForegroundColor Yellow
$corsConfig = gsutil cors get gs://vidstream-98e50.firebasestorage.app
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ CORS configuration verified!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Current CORS configuration:" -ForegroundColor Cyan
    Write-Host $corsConfig -ForegroundColor Gray
} else {
    Write-Host "⚠️  Could not verify CORS configuration, but it may still be working." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host "Your Firebase Storage is now configured for:" -ForegroundColor White
Write-Host "- Local development (localhost:3000, localhost:5173)" -ForegroundColor Cyan
Write-Host "- Vercel deployments (*.vercel.app)" -ForegroundColor Cyan
Write-Host "- Netlify deployments (*.netlify.app, *.netlify.com)" -ForegroundColor Cyan
Write-Host "- Firebase hosting (*.firebaseapp.com, *.web.app)" -ForegroundColor Cyan
Write-Host ""
Write-Host "You can now upload real files in both development and production!" -ForegroundColor Green
Write-Host ""
Read-Host "Press Enter to continue"