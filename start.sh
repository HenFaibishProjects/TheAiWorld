#!/bin/bash

echo "🚀 Starting full build..."

# ---- FRONTEND ----
echo "📦 Building Angular app..."
cd frontend
npm install
ng build --configuration production

echo "📂 Copying Angular dist to backend/public..."
rm -rf ../backend/public
mkdir -p ../backend/public
cp -r dist/frontend/browser/* ../backend/public

# ---- BACKEND ----
echo "📦 Building NestJS backend..."
cd ../backend
npm install
npm run build    # <-- THIS WAS MISSING

echo "🚀 Starting backend..."
npm run start:prod
