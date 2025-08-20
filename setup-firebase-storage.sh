#!/bin/bash

# Firebase Storage CORS Setup Script for Mac/Linux
# This script configures Firebase Storage to work with localhost and deployment platforms

echo "🔥 Firebase Storage CORS Setup"
echo "================================"

# Check if Google Cloud SDK is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Google Cloud SDK not found!"
    echo ""
    echo "Please install Google Cloud SDK first:"
    echo "1. Download from: https://cloud.google.com/sdk/docs/install-sdk"
    echo "2. Run the installer and follow the setup wizard"
    echo "3. Restart your terminal and run this script again"
    echo ""
    read -p "Press Enter to exit"
    exit 1
fi

echo "✅ Google Cloud SDK found"

# Check if user is authenticated
AUTH_CHECK=$(gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>/dev/null)
if [ -z "$AUTH_CHECK" ]; then
    echo "🔐 Authenticating with Google Cloud..."
    gcloud auth login
    if [ $? -ne 0 ]; then
        echo "❌ Authentication failed!"
        read -p "Press Enter to exit"
        exit 1
    fi
fi

echo "✅ Authenticated with Google Cloud"

# Set the project
echo "🎯 Setting Firebase project..."
gcloud config set project vidstream-98e50
if [ $? -ne 0 ]; then
    echo "❌ Failed to set project!"
    read -p "Press Enter to exit"
    exit 1
fi

echo "✅ Project set to vidstream-98e50"

# Check if cors.json exists
if [ ! -f "cors.json" ]; then
    echo "❌ cors.json file not found!"
    echo "Make sure you're running this script from the project root directory."
    read -p "Press Enter to exit"
    exit 1
fi

# Apply CORS configuration
echo "🌐 Applying CORS configuration..."
gsutil cors set cors.json gs://vidstream-98e50.firebasestorage.app
if [ $? -ne 0 ]; then
    echo "❌ Failed to apply CORS configuration!"
    echo "Make sure you have the necessary permissions for the Firebase project."
    read -p "Press Enter to exit"
    exit 1
fi

echo "✅ CORS configuration applied successfully!"

# Verify CORS configuration
echo "🔍 Verifying CORS configuration..."
CORS_CONFIG=$(gsutil cors get gs://vidstream-98e50.firebasestorage.app)
if [ $? -eq 0 ]; then
    echo "✅ CORS configuration verified!"
    echo ""
    echo "Current CORS configuration:"
    echo "$CORS_CONFIG"
else
    echo "⚠️  Could not verify CORS configuration, but it may still be working."
fi

echo ""
echo "🎉 Setup Complete!"
echo "================================"
echo "Your Firebase Storage is now configured for:"
echo "• Local development (localhost:3000, localhost:5173)"
echo "• Vercel deployments (*.vercel.app)"
echo "• Netlify deployments (*.netlify.app, *.netlify.com)"
echo "• Firebase hosting (*.firebaseapp.com, *.web.app)"
echo ""
echo "You can now upload real files in both development and production!"
echo ""
read -p "Press Enter to continue"