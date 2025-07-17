import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './App.css';
import { AuthSection } from './components/AuthSection';
import { GameSection } from './components/GameSection';
import type { User } from './types/auth';

export function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already authenticated
  const checkAuth = async () => {
    try {
      const response = await fetch('/auth/me', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCurrentUser(data.user);
        }
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      console.log('Not authenticated');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  if (isLoading) {
    return (
      <div className="container-fluid bg-dark text-white min-vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid bg-dark text-white min-vh-100">
      <div className="container py-4">
        <h1 className="text-center mb-4">🎯 Dobble Game</h1>

        {currentUser ? (
          <GameSection
            currentUser={currentUser}
            onLogout={handleLogout}
          />
        ) : (
          <AuthSection onLogin={handleLogin} />
        )}
      </div>
    </div>
  );
}
