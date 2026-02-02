# IoT Posture Monitoring System

A comprehensive solution for continuous posture assessment and early risk identification using wearable sensors and machine learning.

## 🌟 Features

- **Real-time posture monitoring** with IoT sensor integration
- **Machine learning-based posture classification**
- **Risk analysis and early detection**
- **Rehabilitation support with exercise library**
- **Dark/Light mode interface** with blue color palette
- **Professional responsive design**
- **Real-time alerts and notifications**
- **Comprehensive analytics and reporting**

## 📁 Project Structure

```
posture-monitoring-system/
├── frontend/          # React.js frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Main application pages
│   │   └── services/      # API service layer
│   ├── public/
│   └── package.json
├── backend/           # Node.js/Express backend API
│   ├── models/           # MongoDB data models
│   ├── routes/           # API route handlers
│   ├── middleware/       # Custom middleware
│   └── server.js         # Main server file
├── package.json       # Root package.json for scripts
└── README.md
```

## 🚀 Quick Start

### Prerequisites

Before running the application, make sure you have:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** (v5 or higher) - [Download here](https://www.mongodb.com/try/download/community)
- **Git** - [Download here](https://git-scm.com/)

### Installation & Setup

1. **Clone the repository** (if from Git):
```bash
git clone <repository-url>
cd posture-monitoring-system
```

2. **Install all dependencies**:
```bash
npm run install-all
```
This will install dependencies for both frontend and backend.

3. **Set up environment variables**:

**Backend Environment (.env)**:
```bash
cd backend
copy .env.example .env
```
Edit `backend/.env` with your settings:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/posture_monitoring
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
```

**Frontend Environment (.env)**:
```bash
cd frontend
copy .env.example .env
```
Edit `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

4. **Start MongoDB**:
Make sure MongoDB is running on your system:
```bash
# Windows (if installed as service)
net start MongoDB

# macOS (with Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

5. **Run the application**:
```bash
# Start both frontend and backend simultaneously
npm start
```

Or run them separately:
```bash
# Terminal 1 - Backend
npm run start-backend

# Terminal 2 - Frontend  
npm run start-frontend
```

## 🌐 Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/health

## 🛠️ Development Commands

```bash
# Install dependencies for both projects
npm run install-all

# Start both frontend and backend
npm start

# Start only frontend
npm run start-frontend

# Start only backend
npm run start-backend

# Build frontend for production
npm run build

# Run tests
npm test
```

## 📱 Using the Application

### 1. **Dashboard**
- View real-time posture monitoring
- Check current posture status and risk level
- Monitor weekly trends and statistics
- Review recent alerts and notifications

### 2. **Posture Analysis**
- Analyze detailed posture history
- View statistical breakdowns
- Export reports for healthcare providers
- Track improvement over time

### 3. **Risk Assessment**
- Get comprehensive risk scoring
- Receive personalized recommendations
- Monitor risk factors and trends
- Set up custom alert thresholds

### 4. **Rehabilitation**
- Access guided exercise library
- Track rehabilitation progress
- Set and monitor exercise goals
- Use built-in exercise timer

### 5. **Settings**
- Manage connected IoT devices
- Configure notification preferences
- Update user profile and medical history
- Adjust privacy and data settings

## 🔧 Technology Stack

### **Frontend**
- **React.js 18** - Modern UI framework
- **Material-UI v5** - Professional component library
- **Chart.js** - Data visualization
- **Axios** - HTTP client
- **React Router** - Navigation
- **Socket.IO Client** - Real-time communication

### **Backend**
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Socket.IO** - Real-time communication
- **JWT** - Authentication
- **Joi** - Data validation
- **Helmet** - Security middleware

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- CORS protection
- Input validation and sanitization
- Helmet security headers

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh token

### Posture Data
- `POST /api/posture/data` - Submit sensor data
- `GET /api/posture/current` - Get current status
- `GET /api/posture/history` - Get posture history
- `GET /api/posture/summary/:period` - Get summary

### Devices
- `GET /api/devices` - Get user devices
- `POST /api/devices` - Add new device
- `PUT /api/devices/:id` - Update device
- `POST /api/devices/:id/calibrate` - Calibrate device

### Analytics
- `GET /api/analytics/dashboard` - Dashboard data
- `GET /api/analytics/trends` - Trend analysis
- `GET /api/analytics/risk-assessment` - Risk assessment

## 🚨 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**:
   - Ensure MongoDB is running
   - Check connection string in `.env`
   - Verify MongoDB service is started

2. **Port Already in Use**:
   - Change ports in environment files
   - Kill processes using the ports:
   ```bash
   # Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   
   # macOS/Linux
   lsof -ti:3000 | xargs kill -9
   ```

3. **CORS Errors**:
   - Verify `FRONTEND_URL` in backend `.env`
   - Check API URL in frontend `.env`

4. **Dependencies Issues**:
   ```bash
   # Clear npm cache
   npm cache clean --force
   
   # Delete node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation