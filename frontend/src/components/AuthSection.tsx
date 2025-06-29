import { useState } from 'react';
import type { User, LoginCredentials, RegisterCredentials, AuthResponse } from '../types/auth';

interface AuthSectionProps {
  onLogin: (user: User) => void;
}

export function AuthSection({ onLogin }: AuthSectionProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loginCredentials, setLoginCredentials] = useState<LoginCredentials>({
    username: '',
    password: ''
  });
  const [registerCredentials, setRegisterCredentials] = useState<RegisterCredentials>({
    username: '',
    password: ''
  });
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(loginCredentials),
      });

      const data: AuthResponse = await response.json();

      if (data.success && data.user) {
        setMessage({ text: data.message, type: 'success' });
        onLogin(data.user);
      } else {
        setMessage({ text: data.message, type: 'error' });
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setMessage({ text: 'Login failed', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(registerCredentials),
      });

      const data: AuthResponse = await response.json();

      if (data.success) {
        setMessage({ text: data.message, type: 'success' });
        setIsLogin(true);
        setRegisterCredentials({ username: '', password: '' });
      } else {
        setMessage({ text: data.message, type: 'error' });
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setMessage({ text: 'Registration failed', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-6 col-lg-4">
        <div className="card bg-dark border-secondary">
          <div className="card-body">
            <h2 className="card-title text-center mb-4">Authentication</h2>

            {isLogin ? (
              // Login Form
              <form onSubmit={handleLogin}>
                <h3 className="h5 mb-3">Login</h3>
                <div className="mb-3">
                  <label htmlFor="loginUsername" className="form-label">Username:</label>
                  <input
                    type="text"
                    className="form-control bg-dark text-white border-secondary"
                    id="loginUsername"
                    placeholder="Enter username"
                    value={loginCredentials.username}
                    onChange={(e) => setLoginCredentials(prev => ({ ...prev, username: e.target.value }))}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="loginPassword" className="form-label">Password:</label>
                  <input
                    type="password"
                    className="form-control bg-dark text-white border-secondary"
                    id="loginPassword"
                    placeholder="Enter password"
                    value={loginCredentials.password}
                    onChange={(e) => setLoginCredentials(prev => ({ ...prev, password: e.target.value }))}
                    required
                  />
                </div>
                <div className="d-grid gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Logging in...' : 'Login'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setIsLogin(false)}
                  >
                    Register Instead
                  </button>
                </div>
              </form>
            ) : (
              // Register Form
              <form onSubmit={handleRegister}>
                <h3 className="h5 mb-3">Register</h3>
                <div className="mb-3">
                  <label htmlFor="registerUsername" className="form-label">Username:</label>
                  <input
                    type="text"
                    className="form-control bg-dark text-white border-secondary"
                    id="registerUsername"
                    placeholder="Enter username (min 3 characters)"
                    value={registerCredentials.username}
                    onChange={(e) => setRegisterCredentials(prev => ({ ...prev, username: e.target.value }))}
                    minLength={3}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="registerPassword" className="form-label">Password:</label>
                  <input
                    type="password"
                    className="form-control bg-dark text-white border-secondary"
                    id="registerPassword"
                    placeholder="Enter password (min 6 characters)"
                    value={registerCredentials.password}
                    onChange={(e) => setRegisterCredentials(prev => ({ ...prev, password: e.target.value }))}
                    minLength={6}
                    required
                  />
                </div>
                <div className="d-grid gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Registering...' : 'Register'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setIsLogin(true)}
                  >
                    Login Instead
                  </button>
                </div>
              </form>
            )}

            {message && (
              <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'} mt-3`}>
                {message.text}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
