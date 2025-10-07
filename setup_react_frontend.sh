#!/bin/bash

echo "🌊 Setting up NeptuneAI React Frontend"
echo "======================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first:"
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm found"

# Create React app
echo "📦 Creating React app..."
npx create-react-app neptuneai-frontend --template typescript

# Navigate to the directory
cd neptuneai-frontend

# Install additional dependencies
echo "📦 Installing additional dependencies..."
npm install @mui/material @emotion/react @emotion/styled
npm install @mui/icons-material
npm install @mui/x-data-grid @mui/x-date-pickers
npm install react-router-dom
npm install axios
npm install plotly.js react-plotly.js
npm install deck.gl react-map-gl mapbox-gl
npm install recharts
npm install react-dropzone
npm install react-query
npm install framer-motion
npm install react-hook-form
npm install react-hot-toast
npm install styled-components
npm install react-helmet-async
npm install dayjs
npm install lodash
npm install date-fns

# Create environment file
echo "⚙️ Creating environment file..."
cat > .env << EOF
REACT_APP_API_URL=http://localhost:8000
REACT_APP_MAPBOX_TOKEN=your_mapbox_token_here
REACT_APP_ANALYTICS_ID=your_analytics_id_here
GENERATE_SOURCEMAP=false
EOF

# Create basic project structure
echo "📁 Creating project structure..."
mkdir -p src/components/Layout
mkdir -p src/components/Charts
mkdir -p src/components/Forms
mkdir -p src/components/Common
mkdir -p src/pages
mkdir -p src/contexts
mkdir -p src/hooks
mkdir -p src/services
mkdir -p src/utils

echo "✅ React frontend setup complete!"
echo ""
echo "🚀 To start the development server:"
echo "   cd neptuneai-frontend"
echo "   npm start"
echo ""
echo "🌐 The app will be available at: http://localhost:3000"
echo ""
echo "📝 Don't forget to:"
echo "   1. Update .env with your API keys"
echo "   2. Start your Python backend on port 8000"
echo "   3. Customize the components as needed"
