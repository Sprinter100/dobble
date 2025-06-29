# Dobble Game Frontend

A React TypeScript frontend for the Dobble multiplayer card game with authentication.

## 🚀 Features

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Bootstrap 5** for responsive UI components
- **Socket.IO Client** for real-time game communication
- **Authentication System** with login/register forms
- **Dark Theme** optimized for gaming

## 📦 Dependencies

- `react` - React library
- `react-dom` - React DOM rendering
- `typescript` - TypeScript support
- `vite` - Build tool and dev server
- `bootstrap` - UI framework
- `socket.IO-client` - WebSocket client

## 🏗️ Project Structure

```
src/
├── components/
│   ├── AuthSection.tsx    # Authentication forms
│   └── GameSection.tsx    # Game interface
├── types/
│   └── auth.ts           # TypeScript interfaces
├── App.tsx               # Main application component
└── main.tsx             # Application entry point
```

## 🎮 Components

### **App.tsx**
- Main application component
- Handles authentication state
- Renders appropriate sections based on user status

### **AuthSection.tsx**
- Login and registration forms
- Form validation and error handling
- Bootstrap-styled UI components

### **GameSection.tsx**
- Real-time game interface
- WebSocket connection management
- Game state display and controls

## 🔧 Development

### **Installation**
```bash
npm install
```

### **Start Development Server**
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### **Build for Production**
```bash
npm run build
```

### **Preview Production Build**
```bash
npm run preview
```

## 🌐 API Integration

### **Backend Connection**
- **Development**: Proxies to `http://localhost:3300`
- **Authentication**: `/auth/*` endpoints
- **WebSocket**: Socket.IO connection for real-time game

### **Environment Variables**
Create a `.env` file for environment-specific settings:
```env
VITE_API_URL=http://localhost:3300
```

## 🎨 Styling

### **Bootstrap Integration**
- Dark theme with Bootstrap 5
- Responsive design
- Custom card layouts for game interface

### **Custom Styles**
- Dark background (`bg-dark`)
- Secondary borders (`border-secondary`)
- Monospace fonts for game logs

## 🔐 Authentication Flow

1. **Page Load**: Check existing session
2. **Login/Register**: Form submission with validation
3. **Session Management**: Automatic session persistence
4. **Logout**: Clear session and redirect

## 🎯 Game Features

- **Real-time Updates**: WebSocket connection
- **Game State Display**: JSON view of current game state
- **Game Log**: Timestamped event log
- **Connection Status**: Visual indicator of WebSocket status

## 🚀 Deployment

### **Build Process**
```bash
npm run build
```

### **Static Hosting**
The built application can be deployed to any static hosting service:
- Netlify
- Vercel
- GitHub Pages
- AWS S3

## 🔧 Configuration

### **Vite Configuration**
- Port: 5173
- Proxy settings for backend API
- WebSocket proxy for real-time communication

### **TypeScript Configuration**
- Strict type checking
- React-specific configurations
- Path aliases for clean imports

## 🎮 Usage

1. **Start Backend**: Ensure the NestJS backend is running on port 3300
2. **Start Frontend**: Run `npm run dev`
3. **Access Application**: Open `http://localhost:5173`
4. **Register/Login**: Create account or login with existing credentials
5. **Play Game**: Use the game controls to interact with the Dobble game

## 🔮 Future Enhancements

- **OAuth Integration**: Google, GitHub login
- **Game Visualizations**: Card display and animations
- **User Profiles**: Statistics and achievements
- **Real-time Chat**: Player communication
- **Game History**: Past game results

The frontend provides a modern, responsive interface for the Dobble game with full authentication and real-time gameplay capabilities! 🎮
