# SpineSense Backend

Express.js backend API for the SpineSense posture monitoring system.

## Project Structure

```
backend/
├── controllers/          # Request handlers
│   ├── authController.js
│   ├── userController.js
│   ├── postureController.js
│   └── analyticsController.js
├── helpers/              # Utility functions
│   └── postureHelper.js
├── middleware/           # Express middleware
│   └── auth.js
├── routes/              # Route definitions
│   ├── auth.js
│   ├── users.js
│   ├── posture.js
│   └── analytics.js
├── analyticsCache.js    # Firebase polling & caching
├── db.js               # MySQL configuration
├── firebase.js         # Firebase configuration
├── server.js           # Main server entry
└── package.json
```

## Technology Stack

- **Express.js** - Web framework
- **MySQL** - User database (via mysql2)
- **Firebase Admin** - Realtime Database
- **Socket.IO** - Real-time communication
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Posture
- `GET /api/posture/current` - Get current posture status
- `GET /api/posture/history` - Get posture history
- `GET /api/posture/summary/:period` - Get posture summary
- `POST /api/posture/data` - Submit sensor data

### Analytics
- `GET /api/analytics/dashboard` - Dashboard data
- `GET /api/analytics/trends` - Trend analysis
- `GET /api/analytics/risk-assessment` - Risk assessment

### Users
- `GET /api/users/dashboard-stats` - Dashboard statistics
- `GET /api/users/profile` - User profile
- `GET /api/users/settings` - User settings

## Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=spinesense
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
```

## Installation

```bash
cd backend
npm install
```

## Running the Server

### Development (with auto-reload)
```bash
npm run dev
```

### Production
```bash
npm start
```

Server runs at: http://localhost:5000

## Architecture

The backend follows a **MVC-like** pattern with clear separation:

1. **Routes** - Map HTTP methods to controller functions
2. **Controllers** - Handle business logic and data processing
3. **Services** - Firebase and database interactions
4. **Middleware** - Authentication and request validation

## Real-time Features

- Socket.IO connection for live posture updates
- Firebase Realtime Database listeners for sensor data
- 5-minute polling interval for analytics cache
