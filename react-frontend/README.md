# 🌊 NeptuneAI React Frontend

A modern, interactive React frontend for the NeptuneAI ARGO Ocean Data Platform.

## ✨ Features

- **Modern UI/UX** - Built with Material-UI and Framer Motion
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Interactive Visualizations** - Plotly.js charts and Deck.gl maps
- **Real-time Analytics** - Live data processing and visualization
- **AI Integration** - Natural language queries and insights
- **User Authentication** - Secure login and profile management
- **Dark Mode** - Toggle between light and dark themes
- **Ocean Theme** - Beautiful ocean-inspired design

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ 
- npm or yarn
- Backend API running on port 8000

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

### Development

```bash
# Start with hot reload
npm start

# Run tests
npm test

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout/         # Layout components (Navbar, Sidebar, Footer)
│   ├── Charts/         # Chart components
│   ├── Forms/          # Form components
│   └── Common/         # Common UI components
├── pages/              # Page components
│   ├── Home.js         # Landing page
│   ├── Analytics.js    # Data analytics page
│   ├── Datasets.js     # Dataset management
│   ├── Upload.js       # File upload page
│   ├── AIInsights.js   # AI insights page
│   ├── Profile.js      # User profile page
│   └── About.js        # About page
├── contexts/           # React contexts
│   ├── AuthContext.js  # Authentication context
│   └── ThemeContext.js # Theme context
├── hooks/              # Custom React hooks
├── services/           # API services
├── utils/              # Utility functions
├── theme.js            # Material-UI theme
└── index.js            # App entry point
```

## 🎨 Design System

### Colors
- **Primary**: Ocean Blue (#3498db)
- **Secondary**: Seafoam Green (#2ecc71)
- **Accent**: Coral Red (#e74c3c)
- **Ocean**: Deep Blue (#1e3c72)

### Typography
- **Font**: Inter (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700

### Components
- **Cards**: Rounded corners (15px), subtle shadows
- **Buttons**: Gradient backgrounds, hover animations
- **Forms**: Rounded inputs, focus states
- **Charts**: Interactive, responsive

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```bash
REACT_APP_API_URL=http://localhost:8000
REACT_APP_MAPBOX_TOKEN=your_mapbox_token
REACT_APP_ANALYTICS_ID=your_analytics_id
```

### API Integration

The frontend expects a backend API running on port 8000 with the following endpoints:

- `GET /api/health` - Health check
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/data/analytics` - Analytics data
- `POST /api/data/upload` - File upload
- `POST /api/ai/query` - AI insights

## 📱 Responsive Design

- **Desktop** (1200px+): Full sidebar, multi-column layout
- **Tablet** (768px-1199px): Collapsible sidebar, adjusted columns
- **Mobile** (320px-767px): Stacked layout, mobile navigation

## 🎯 Key Features

### Home Page
- Hero section with ocean animation
- Feature showcase cards
- Statistics dashboard
- Call-to-action sections

### Analytics Page
- Interactive data filters
- Real-time metrics
- Multiple chart types
- Geographic maps
- Data tables

### AI Insights Page
- Natural language query input
- AI-powered analysis
- Pattern recognition
- Predictive modeling
- Insight history

### Upload Page
- Drag-and-drop file upload
- Multiple format support
- Processing options
- Quality validation
- Progress tracking

## 🔐 Authentication

- JWT-based authentication
- Secure token storage
- Protected routes
- User profile management
- Session persistence

## 🌙 Dark Mode

- Toggle between light and dark themes
- Persistent theme preference
- Smooth transitions
- Ocean-themed color schemes

## 📊 Data Visualization

- **Plotly.js** - Interactive charts
- **Deck.gl** - Geographic visualizations
- **Recharts** - Simple charts
- **Material-UI** - UI components

## 🚀 Deployment

### Production Build

```bash
npm run build
```

### Docker

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Setup

1. **Development**: `npm start`
2. **Production**: `npm run build && serve -s build`
3. **Docker**: `docker build -t neptuneai-frontend .`

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if needed
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Support

- **Documentation**: [docs.neptuneai.com](https://docs.neptuneai.com)
- **Issues**: [GitHub Issues](https://github.com/neptuneai/issues)
- **Email**: support@neptuneai.com

---

**🌊 Built with ❤️ for Ocean Science**