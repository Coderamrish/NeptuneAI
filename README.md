# 🌊 NeptuneAI Ocean Data Platform v2.0

**Advanced AI-Powered Ocean Data Analytics & Visualization Platform**

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://python.org)
[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.68.0-green.svg)](https://fastapi.tiangolo.com)
[![Material-UI](https://img.shields.io/badge/Material--UI-5.11.10-blue.svg)](https://mui.com)

## 🚀 Features

### 🔐 Authentication & User Management
- **Secure Login/Signup** with JWT tokens
- **User Profile Management** with real-time updates
- **Role-based Access Control**
- **Session Management** with persistent login

### 📊 Advanced Analytics Dashboard
- **Real-time Ocean Data Visualization**
- **Interactive Charts & Graphs** with Plotly.js
- **Geographic Data Mapping** with filtering
- **Customizable Time Series Analysis**
- **Data Export** (CSV, JSON formats)

### 🤖 AI-Powered Insights
- **Real-time AI Chatbot** with ocean data expertise
- **Natural Language Queries** about marine data
- **Automated Plot Generation** from AI responses
- **Chat History & Session Management**
- **Intelligent Data Analysis**

### 🔍 Data Explorer
- **Advanced Filtering System** by region, year, parameters
- **Interactive Data Tables** with pagination
- **Multiple Visualization Modes** (Table, Charts, Map)
- **Real-time Parameter Monitoring**
- **Data Quality Indicators**

### 🎨 Modern UI/UX
- **Responsive Design** for all devices
- **Dark/Light Mode Toggle**
- **Smooth Animations** with Framer Motion
- **Professional Ocean Theme**
- **Accessibility Features**

### 🔔 Notification System
- **Real-time Notifications** for data updates
- **System Status Alerts**
- **User Activity Notifications**
- **Interactive Notification Center**

## 🛠️ Technology Stack

### Backend
- **FastAPI** - Modern, fast web framework
- **SQLite** - Lightweight database
- **SQLAlchemy** - ORM for database operations
- **JWT** - Secure authentication
- **bcrypt** - Password hashing
- **Pandas** - Data manipulation
- **Plotly** - Data visualization

### Frontend
- **React 18** - Modern UI library
- **Material-UI (MUI)** - Component library
- **React Router** - Client-side routing
- **Framer Motion** - Animations
- **Plotly.js** - Interactive charts
- **Axios** - HTTP client
- **React Query** - Data fetching

### AI & Data Processing
- **OpenAI API** - AI-powered insights
- **Sentence Transformers** - Text embeddings
- **FAISS** - Vector similarity search
- **Pandas** - Data analysis
- **NumPy** - Numerical computing

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd neptuneai-ocean-platform
```

2. **Run the automated setup**
```bash
python launch_full_stack.py
```

This script will:
- ✅ Check system requirements
- 📦 Install all dependencies
- 🗄️ Setup the database
- 🚀 Start both backend and frontend servers

### Manual Installation

#### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn api:app --host 0.0.0.0 --port 8000 --reload
```

#### Frontend Setup
```bash
cd react-frontend
npm install
npm start
```

## 🌐 Access Points

- **Frontend Application**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Interactive API Explorer**: http://localhost:8000/redoc

## 📱 Application Features

### 🏠 Dashboard
- Real-time ocean data overview
- Key performance indicators
- System status monitoring
- Quick access to all features

### 📊 Analytics
- Interactive data visualization
- Geographic data mapping
- Time series analysis
- Customizable charts and graphs
- Data export capabilities

### 🔍 Data Explorer
- Advanced filtering system
- Multiple data views
- Real-time parameter monitoring
- Interactive data tables

### 🤖 AI Insights
- Natural language queries
- Real-time AI responses
- Automated visualization generation
- Chat history management

### 👤 User Profile
- Profile management
- Account settings
- Activity history
- Notification preferences

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Token verification
- `PUT /api/auth/profile` - Update profile

### Data Management
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/dashboard/geographic-data` - Geographic data
- `GET /api/dashboard/profiler-stats` - Profiler statistics
- `GET /api/dashboard/monthly-distribution` - Monthly data

### AI Chat
- `POST /api/chat/message` - Send chat message
- `POST /api/chat/session` - Create chat session
- `GET /api/chat/sessions` - Get chat sessions
- `GET /api/chat/messages/{session_id}` - Get chat messages

### Notifications
- `GET /api/notifications` - Get notifications
- `POST /api/notifications` - Create notification
- `PUT /api/notifications/{id}/read` - Mark as read

### Data Export
- `GET /api/export/csv` - Export CSV data
- `GET /api/export/json` - Export JSON data

## 🎨 UI Components

### Layout Components
- **Navbar** - Top navigation with user menu and notifications
- **Sidebar** - Collapsible navigation with ocean parameters
- **Footer** - Comprehensive footer with links and information

### Page Components
- **Dashboard** - Main overview page
- **Analytics** - Data visualization and analysis
- **DataExplorer** - Advanced data exploration
- **AIInsights** - AI-powered chat interface
- **Profile** - User profile management

### Authentication Components
- **Login** - User login form
- **Signup** - User registration form
- **AuthWrapper** - Authentication wrapper

## 🔒 Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt encryption
- **CORS Protection** - Cross-origin request security
- **Input Validation** - Pydantic model validation
- **SQL Injection Prevention** - Parameterized queries

## 📈 Performance Features

- **Lazy Loading** - Component-based code splitting
- **Data Pagination** - Efficient data handling
- **Caching** - React Query caching
- **Optimized Queries** - Database query optimization
- **Responsive Design** - Mobile-first approach

## 🧪 Testing

```bash
# Backend tests
cd backend
python -m pytest

# Frontend tests
cd react-frontend
npm test
```

## 📦 Deployment

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up --build
```

### Production Deployment
```bash
# Backend
cd backend
gunicorn api:app -w 4 -k uvicorn.workers.UvicornWorker

# Frontend
cd react-frontend
npm run build
# Serve the build folder with nginx or similar
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **ARGO Program** - Ocean data source
- **Material-UI** - UI component library
- **FastAPI** - Backend framework
- **React** - Frontend library
- **OpenAI** - AI capabilities

## 📞 Support

- **Email**: contact@neptuneai.com
- **Documentation**: [docs.neptuneai.com](https://docs.neptuneai.com)
- **Issues**: [GitHub Issues](https://github.com/neptuneai/issues)

---

**Made with ❤️ for Ocean Research and Marine Science**

*NeptuneAI v2.0 - Advanced Ocean Data Analytics Platform*