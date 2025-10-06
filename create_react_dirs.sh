#!/bin/bash

echo "🌊 Creating NeptuneAI React Frontend Directory Structure"
echo "======================================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the neptuneai-frontend directory"
    echo "   cd neptuneai-frontend"
    echo "   ./create_react_dirs.sh"
    exit 1
fi

echo "📁 Creating directory structure..."

# Main source directories
mkdir -p src/components/Layout
mkdir -p src/components/Charts
mkdir -p src/components/Forms
mkdir -p src/components/Common
mkdir -p src/components/UI
mkdir -p src/components/Data
mkdir -p src/components/Auth

# Pages
mkdir -p src/pages/Home
mkdir -p src/pages/Analytics
mkdir -p src/pages/Datasets
mkdir -p src/pages/Upload
mkdir -p src/pages/AIInsights
mkdir -p src/pages/Profile
mkdir -p src/pages/About
mkdir -p src/pages/Auth
mkdir -p src/pages/Error

# Contexts and state management
mkdir -p src/contexts
mkdir -p src/store
mkdir -p src/hooks

# Services and API
mkdir -p src/services
mkdir -p src/api
mkdir -p src/config

# Utilities and helpers
mkdir -p src/utils
mkdir -p src/helpers
mkdir -p src/validators
mkdir -p src/constants
mkdir -p src/types

# Assets
mkdir -p src/assets/images
mkdir -p src/assets/icons
mkdir -p src/assets/fonts
mkdir -p src/assets/data
mkdir -p src/assets/videos

# Styles
mkdir -p src/styles
mkdir -p src/styles/components
mkdir -p src/styles/pages
mkdir -p src/styles/themes

# Testing
mkdir -p src/tests
mkdir -p src/tests/components
mkdir -p src/tests/pages
mkdir -p src/tests/utils
mkdir -p src/tests/mocks

# Public assets
mkdir -p public/images
mkdir -p public/icons
mkdir -p public/data

# Documentation
mkdir -p docs
mkdir -p docs/components
mkdir -p docs/api

echo "✅ Directory structure created successfully!"
echo ""
echo "📁 Created directories:"
echo "   src/components/     - Reusable UI components"
echo "   src/pages/          - Page components"
echo "   src/contexts/       - React contexts"
echo "   src/hooks/          - Custom hooks"
echo "   src/services/       - API services"
echo "   src/utils/          - Utility functions"
echo "   src/assets/         - Static assets"
echo "   src/styles/         - Styling files"
echo "   src/tests/          - Test files"
echo "   public/             - Public assets"
echo ""
echo "🚀 Ready to start building your React components!"