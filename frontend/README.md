# SpineSense Frontend

React.js frontend application for the SpineSense posture monitoring system.

## Project Structure

```
frontend/src/
├── components/          # Reusable UI components
│   ├── Navbar.js
│   ├── Sidebar.js
│   └── PostureChart.js
├── context/             # React context providers
│   └── AuthContext.js
├── pages/               # Page components
│   ├── Dashboard.js
│   ├── Login.js
│   ├── Register.js
│   ├── PostureAnalysis.js
│   ├── RiskAssessment.js
│   ├── Rehabilitation.js
│   └── Settings.js
├── services/            # API service layer
│   └── api.js
├── App.js               # Main application component
└── index.js             # Application entry point
```

## Technology Stack

- **React.js 18** - UI framework
- **Material-UI v5** - Component library
- **Chart.js** - Data visualization
- **Socket.IO Client** - Real-time communication
- **React Router** - Navigation

## Features

- Real-time posture monitoring dashboard
- Posture history and trend analysis
- Risk assessment and alerts
- Rehabilitation exercise tracking
- User authentication
- Dark/Light mode interface

## Environment Variables

Create a `.env` file in the frontend directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

## Installation

```bash
cd frontend
npm install
```

## Running the Application

### Development
```bash
npm start
```

### Production Build
```bash
npm run build
```

Application runs at: http://localhost:3000

## API Integration

The frontend uses the native `fetch` API for HTTP requests. All endpoints are defined in `services/api.js`:

- **postureAPI** - Posture data endpoints
- **analyticsAPI** - Analytics and trends
- **userAPI** - User profile and settings
- **authAPI** - Authentication endpoints

## Authentication

JWT-based authentication with token stored in localStorage. The `AuthContext` provider manages user state across the application.
