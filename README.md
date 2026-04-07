# SpineSense

IoT-based posture monitoring system with real-time analytics and risk assessment.

## Project Overview

SpineSense is a comprehensive solution for continuous posture assessment using wearable sensors and machine learning. The system provides real-time monitoring, analytics, and risk analysis through a modern web interface.

## Project Structure

```
spine-sense/
├── backend/                 # Express.js API server
│   ├── controllers/         # Request handlers
│   ├── helpers/             # Utility functions
│   ├── middleware/          # Express middleware
│   ├── routes/              # Route definitions
│   ├── analyticsCache.js    # Firebase polling
│   ├── db.js               # MySQL configuration
│   ├── firebase.js         # Firebase configuration
│   ├── server.js           # Main server
│   └── README.md
├── frontend/                # React.js application
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── context/         # Auth context
│   │   ├── pages/          # Page components
│   │   └── services/       # API service
│   └── README.md
├── package.json             # Root scripts
└── README.md
```

## Features

- Real-time posture monitoring with IoT sensors
- Machine learning-based posture classification
- Risk analysis and early detection
- Rehabilitation support with exercise library
- Dark/Light mode interface
- Comprehensive analytics and reporting

## Technology Stack

### Backend
- **Express.js** - Web framework
- **MySQL** - User database
- **Firebase** - Realtime Database
- **Socket.IO** - Real-time communication
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Frontend
- **React.js 18** - UI framework
- **Material-UI v5** - Component library
- **Chart.js** - Data visualization
- **Socket.IO Client** - Real-time updates

## Prerequisites

- Node.js (v16+)
- MySQL (v8+)
- Firebase project with Realtime Database

## Installation

```bash
# Install all dependencies
npm run install-all
```

Or install individually:

```bash
# Backend dependencies
npm run install-backend

# Frontend dependencies
npm run install-frontend
```

## Environment Setup

**Backend (.env):**
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=spinesense
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
```

**Frontend (.env):**
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

## Running the Application

### Run Both (Frontend + Backend)
```bash
npm start
```

### Run Backend Only
```bash
npm run start-backend
```
Backend runs at: http://localhost:5000

### Run Frontend Only
```bash
npm run start-frontend
```
Frontend runs at: http://localhost:3000

### Development Mode (Backend with auto-reload)
```bash
cd backend && npm run dev
```

## Docker Deployment

1. Ensure Docker and Docker Compose v2 are installed.
2. (Optional) Copy your Firebase `serviceAccount.json` into `backend/` and remove the comment in `docker-compose.yml` to mount it, or provide another bind mount when running `docker compose`.
3. Override any secrets by creating a `.env` file in the repository root; values such as `MYSQL_PASSWORD`, `JWT_SECRET`, and `FIREBASE_DATABASE_URL` will be picked up automatically.
4. Build and start the full stack:

```bash
docker compose up --build
```

The services start with the following host ports:

- Backend API: http://localhost:5000
- Frontend UI: http://localhost:3000
- MySQL: exposed on 3306 for local tools

To rebuild after code changes, rerun `docker compose up --build`. Shut everything down with `docker compose down`, and preserve database data across runs via the managed `mysql-data` volume.

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Posture
- `GET /api/posture/current` - Current posture status
- `GET /api/posture/history` - Posture history
- `GET /api/posture/summary/:period` - Period summary
- `POST /api/posture/data` - Submit sensor data

### Analytics
- `GET /api/analytics/dashboard` - Dashboard data
- `GET /api/analytics/trends` - Trend analysis
- `GET /api/analytics/risk-assessment` - Risk assessment

### Users
- `GET /api/users/dashboard-stats` - Dashboard statistics
- `GET /api/users/profile` - User profile
- `GET /api/users/settings` - User settings

## License

MIT
