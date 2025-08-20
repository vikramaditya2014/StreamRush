#!/bin/bash

# YouTube Clone Setup Script
# This script helps you set up the YouTube Clone project

set -e

echo "🎬 YouTube Clone Setup Script"
echo "=============================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "🔧 Installing Firebase CLI..."
    npm install -g firebase-tools
else
    echo "✅ Firebase CLI detected"
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        echo "📝 Creating .env file from .env.example..."
        cp .env.example .env
        echo "⚠️  Please edit .env file with your Firebase configuration"
    else
        echo "❌ .env.example file not found"
        exit 1
    fi
else
    echo "✅ .env file exists"
fi

# Login to Firebase
echo "🔐 Logging into Firebase..."
echo "Please follow the browser authentication flow..."
firebase login

# List available projects
echo "📋 Available Firebase projects:"
firebase projects:list

# Prompt for project selection
echo ""
read -p "Enter your Firebase project ID: " PROJECT_ID

if [ -z "$PROJECT_ID" ]; then
    echo "❌ Project ID cannot be empty"
    exit 1
fi

# Use the selected project
echo "🎯 Using Firebase project: $PROJECT_ID"
firebase use "$PROJECT_ID"

# Initialize Firebase (if not already done)
if [ ! -f "firebase.json" ]; then
    echo "🚀 Initializing Firebase..."
    firebase init
else
    echo "✅ Firebase already initialized"
fi

# Deploy Firestore rules and indexes
echo "📋 Deploying Firestore rules and indexes..."
firebase deploy --only firestore:rules,firestore:indexes,storage:rules

# Build the project
echo "🏗️  Building the project..."
npm run build

# Deploy to Firebase Hosting
echo "🚀 Deploying to Firebase Hosting..."
firebase deploy --only hosting

# Get the hosting URL
HOSTING_URL=$(firebase hosting:channel:list | grep -E "live.*https://" | awk '{print $3}' | head -1)

echo ""
echo "🎉 Setup completed successfully!"
echo "================================"
echo "Your YouTube Clone is now deployed at:"
echo "🌐 $HOSTING_URL"
echo ""
echo "Next steps:"
echo "1. Configure Firebase Authentication providers in the Firebase Console"
echo "2. Set up your custom domain (optional)"
echo "3. Enable Firebase Analytics (optional)"
echo ""
echo "Useful commands:"
echo "• npm run dev          - Start development server"
echo "• npm run build        - Build for production"
echo "• npm run deploy       - Deploy to Firebase"
echo "• npm run deploy:rules - Deploy only Firestore/Storage rules"
echo ""
echo "Happy coding! 🎬✨"