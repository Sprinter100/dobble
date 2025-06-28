# Authentication System for Dobble Game

This document describes the session-based authentication system implemented for the Dobble multiplayer card game.

## Features

### 🔐 Authentication Features
- **User Registration**: Create new accounts with username/password
- **User Login**: Secure login with password hashing
- **Session Management**: Persistent sessions with cookies
- **Logout**: Secure session termination
- **User Profile**: Get current user information

### 🎮 Game Integration
- **Authenticated Players**: Players are identified by their username
- **Anonymous Fallback**: Non-authenticated users can still play with device ID
- **WebSocket Authentication**: Sessions work with real-time game connections

## API Endpoints

### Authentication Endpoints

#### POST `/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "username": "string (min 3 characters)",
  "password": "string (min 6 characters)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "user_id",
    "username": "username",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### POST `/auth/login`
Login with existing credentials.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "user_id",
    "username": "username",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### POST `/auth/logout`
Logout and destroy session.

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

#### GET `/auth/me`
Get current user information.

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "username": "username",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## Security Features

### 🔒 Password Security
- **Bcrypt Hashing**: Passwords are hashed using bcrypt with salt rounds of 10
- **No Plain Text**: Passwords are never stored in plain text

### 🍪 Session Security
- **HttpOnly Cookies**: Session cookies are HttpOnly to prevent XSS attacks
- **Secure Cookies**: In production, cookies are marked as secure
- **SameSite Protection**: Cookies use 'lax' SameSite policy
- **Session Expiry**: Sessions expire after 24 hours

### 🌐 CORS Configuration
- **Credentials Support**: CORS is configured to support credentials
- **Origin Whitelist**: Only allowed origins can access the API

## Frontend Integration

### Authentication Flow
1. **Page Load**: Check if user is already authenticated
2. **Login/Register**: Show appropriate forms based on user choice
3. **Session Persistence**: Sessions persist across browser sessions
4. **Game Access**: Only authenticated users can access the game

### WebSocket Integration
- **Session Cookies**: WebSocket connections include session cookies
- **User Identification**: Authenticated users are identified by username
- **Anonymous Fallback**: Non-authenticated users get device-based IDs

## Environment Variables

```bash
# Session secret (change in production)
SESSION_SECRET=your-secret-key-change-in-production

# Node environment
NODE_ENV=development

# Server port
PORT=3000
```

## Usage

### Starting the Server
```bash
cd backend
pnpm install
pnpm run start:dev
```

### Accessing the Game
1. Open `frontend/index.html` in a browser
2. Register a new account or login with existing credentials
3. Start playing the Dobble game!

## Technical Implementation

### Backend Architecture
- **AuthService**: Handles user management and session storage
- **AuthController**: HTTP endpoints for authentication
- **SessionMiddleware**: Middleware for session management
- **EventsGateway**: WebSocket gateway with authentication integration

### Data Storage
- **In-Memory Storage**: Users and sessions are stored in memory (for development)
- **Production Ready**: Can be easily extended to use database storage

### Session Management
- **Express Sessions**: Uses express-session for session handling
- **Cookie Parser**: Parses session cookies from requests
- **Session Validation**: Validates sessions on each request

## Future Enhancements

### Database Integration
- Replace in-memory storage with PostgreSQL
- Add user profiles and game statistics
- Implement user rankings and leaderboards

### Enhanced Security
- Add rate limiting for authentication endpoints
- Implement password reset functionality
- Add email verification for new accounts

### Game Features
- Persistent game history
- User achievements and badges
- Friend system and private games
