# Passport.js Authentication Integration

This document describes the Passport.js authentication system integrated into the Dobble game.

## 🚀 What's New with Passport.js

### **Enhanced Authentication Features**
- **Passport Local Strategy**: Robust username/password authentication
- **Session Management**: Built-in session serialization/deserialization
- **Route Guards**: Protect routes with authentication guards
- **Type Safety**: Proper TypeScript integration

## 📦 Dependencies Added

```bash
pnpm add passport passport-local @types/passport @types/passport-local @nestjs/passport
```

## 🏗️ Architecture Overview

### **Core Components**

1. **LocalStrategy** (`passport.strategy.ts`)
   - Handles username/password validation
   - Integrates with existing AuthService
   - Returns typed User objects

2. **SessionSerializer** (`passport.serializer.ts`)
   - Manages session serialization/deserialization
   - Stores user data in session

3. **Authentication Guards** (`auth.guard.ts`)
   - `AuthenticatedGuard`: Protects routes requiring login
   - `NotAuthenticatedGuard`: Prevents logged-in users from accessing auth pages

4. **Updated AuthController**
   - Uses Passport for login/logout
   - Protected routes with guards
   - Proper session management

## 🔧 Configuration

### **Main Application Setup** (`main.ts`)
```typescript
// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());
```

### **Auth Module** (`auth.module.ts`)
```typescript
@Module({
  imports: [PassportModule.register({ session: true })],
  providers: [
    AuthService,
    LocalStrategy,
    SessionSerializer,
    AuthenticatedGuard,
    NotAuthenticatedGuard
  ],
  // ...
})
```

## 🛡️ Route Protection

### **Protected Routes**
```typescript
@Get('me')
@UseGuards(AuthenticatedGuard)
getCurrentUser(@Req() req: AuthenticatedRequest) {
  // Only accessible to authenticated users
}

@Post('logout')
@UseGuards(AuthenticatedGuard)
logout(@Req() req: AuthenticatedRequest) {
  // Only accessible to authenticated users
}
```

### **Public Routes**
```typescript
@Post('login')
@UseGuards(NotAuthenticatedGuard)
async login(@Body() loginDto: LoginDto) {
  // Only accessible to non-authenticated users
}

@Post('register')
@UseGuards(NotAuthenticatedGuard)
async register(@Body() registerDto: RegisterDto) {
  // Only accessible to non-authenticated users
}
```

## 🔄 Session Flow

### **Login Process**
1. User submits credentials
2. `LocalStrategy.validate()` checks credentials
3. `req.login()` creates session
4. User data serialized to session
5. Response sent to client

### **Session Validation**
1. Request comes in with session cookie
2. Passport deserializes user from session
3. `req.user` contains user data
4. Guards check authentication status

### **Logout Process**
1. `req.logout()` destroys session
2. Session cookie cleared
3. User redirected to login

## 🌐 WebSocket Integration

### **Session Access in WebSocket**
```typescript
getClientId(client: Socket): string {
  const session = (client.request as any).session as SessionData;
  if (session?.passport?.user?.id) {
    return session.passport.user.id;
  }
  // Fallback to device ID
}
```

## 🔒 Security Features

### **Session Security**
- **HttpOnly Cookies**: Prevents XSS attacks
- **Secure Cookies**: In production
- **SameSite Protection**: CSRF protection
- **Session Expiry**: 24-hour timeout

### **Route Protection**
- **Authentication Guards**: Prevent unauthorized access
- **Input Validation**: Server-side validation
- **Password Hashing**: Bcrypt with salt

## 🎮 Game Integration

### **Player Identification**
- **Authenticated Users**: Identified by username from session
- **Anonymous Users**: Fallback to device ID
- **Seamless Experience**: No interruption for existing users

### **Real-time Updates**
- **Session Persistence**: Works across WebSocket connections
- **User Context**: Game events include user information
- **State Synchronization**: All players see consistent state

## 🚀 Benefits of Passport.js

### **✅ Standardization**
- Industry-standard authentication library
- Well-documented and maintained
- Large community support

### **✅ Extensibility**
- Easy to add OAuth providers (Google, GitHub, etc.)
- Multiple authentication strategies
- Custom strategy support

### **✅ Security**
- Built-in security best practices
- Session management
- CSRF protection

### **✅ Type Safety**
- Full TypeScript support
- Proper type definitions
- Compile-time error checking

## 🔮 Future Enhancements

### **OAuth Integration**
- Google OAuth for easy login
- GitHub OAuth for developers
- Facebook OAuth for social login

### **Advanced Features**
- Remember me functionality
- Password reset via email
- Two-factor authentication
- Account linking

### **Database Integration**
- Persistent user storage
- User profiles and preferences
- Game statistics and achievements

## 🎯 Usage

### **Starting the Server**
```bash
cd backend
pnpm run start:dev
```

### **Accessing the Game**
1. Open `http://localhost:3300`
2. Register or login with credentials
3. Start playing Dobble!

The Passport.js integration provides a robust, secure, and extensible authentication system for your Dobble game! 🎮
