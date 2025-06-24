#!/bin/bash

set -e

echo "🚀 Starting deployment to GitHub Pages..."

# Build on master and store output in a temp directory
BUILD_DIR=$(mktemp -d)
echo "📦 Building project into $BUILD_DIR..."
npm run build
cp -r dist/* "$BUILD_DIR/"
cp .gitignore "$BUILD_DIR/.gitignore"

# Switch to gh-pages branch
echo "🔄 Switching to gh-pages branch..."
git checkout gh-pages

# Remove all tracked files except .git
echo "🧹 Cleaning gh-pages branch..."
git rm -rf . || true

# Copy built files from temp dir to root
echo "📋 Copying built files from $BUILD_DIR..."
cp -r "$BUILD_DIR"/* .

# Add all files
echo "➕ Adding files to git..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "Deploy to GitHub Pages - $(date)" || echo "No changes to commit."

# Push to origin
echo "📤 Pushing to GitHub..."
git push origin gh-pages

# Switch back to master
echo "🔄 Switching back to master..."
git checkout master

# Clean up
echo "🧹 Cleaning up temp build directory..."
rm -rf "$BUILD_DIR"

echo "✅ Deployment complete!"
echo "🌐 Your site should be available at: https://zuramm.github.io/royal_game_of_ur_ts/"