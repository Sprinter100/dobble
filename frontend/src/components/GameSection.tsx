import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import type { User } from '../types/auth';

interface GameSectionProps {
  currentUser: User;
  onLogout: () => void;
}

interface GameState {
  players: Array<{
    id: string;
    name: string;
    moves: number;
    hand: string[];
    canMove: boolean;
    isReady: boolean;
  }>;
  currentTurn: string[];
}

export function GameSection({ currentUser, onLogout }: GameSectionProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [gameLog, setGameLog] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const addToGameLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setGameLog(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const handleLogout = async () => {
    try {
      await fetch('/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });

      if (socket) {
        socket.disconnect();
      }
      onLogout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleMove = () => {
    if (socket) {
      socket.emit('move', null, (response: unknown) => {
        console.log('move:', response);
      });
    }
  };

  const handleReady = () => {
    if (socket) {
      socket.emit('playerReady');
    }
  };

  useEffect(() => {
    const newSocket = io('/', {
      withCredentials: true
    });

    newSocket.on('connect', () => {
      console.log('Connected to game server');
      setIsConnected(true);
      addToGameLog('Connected to game server');
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected');
      setIsConnected(false);
      addToGameLog('Disconnected from game server');
    });

    newSocket.on('playerMove', (data: string) => {
      console.log(data);
      addToGameLog(`Player move: ${data}`);
    });

    newSocket.on('handlePlayerUnblocked', () => {
      console.log('Player unblocked');
      addToGameLog('Player unblocked');
    });

    newSocket.on('gameState', (data: GameState) => {
      console.log('gameState', data);
      setGameState(data);
    });

    newSocket.on('stateChange', (data: GameState) => {
      console.log('stateChange', data);
      setGameState(data);
    });

    newSocket.on('events', (data: unknown) => {
      console.log('event', data);
      addToGameLog(`Event: ${JSON.stringify(data)}`);
    });

    newSocket.on('exception', (data: unknown) => {
      console.log('exception', data);
      addToGameLog(`Exception: ${JSON.stringify(data)}`);
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <div className="row">
      <div className="col-12">
        {/* User Info */}
        <div className="card bg-dark border-secondary mb-4">
          <div className="card-body d-flex justify-content-between align-items-center">
            <strong>Welcome, {currentUser.username}!</strong>
            <button
              onClick={handleLogout}
              className="btn btn-outline-danger"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Game Controls */}
        <div className="card bg-dark border-secondary mb-4">
          <div className="card-body">
            <h2 className="h4 mb-3">Game Controls</h2>
            <div className="d-flex gap-2">
              <button
                onClick={handleMove}
                className="btn btn-primary"
                disabled={!isConnected}
              >
                Make Move
              </button>
              <button
                onClick={handleReady}
                className="btn btn-success"
                disabled={!isConnected}
              >
                Ready
              </button>
              <div className="ms-auto">
                <span className={`badge ${isConnected ? 'bg-success' : 'bg-danger'}`}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Game State */}
        <div className="card bg-dark border-secondary mb-4">
          <div className="card-body">
            <h3 className="h5 mb-3">Game State</h3>
            <pre className="bg-dark text-white border border-secondary p-3 rounded" style={{ maxHeight: '300px', overflow: 'auto' }}>
              {gameState ? JSON.stringify(gameState, null, 2) : 'Waiting for game state...'}
            </pre>
          </div>
        </div>

        {/* Game Log */}
        <div className="card bg-dark border-secondary">
          <div className="card-body">
            <h3 className="h5 mb-3">Game Log</h3>
            <div
              className="bg-dark text-white border border-secondary p-3 rounded"
              style={{
                maxHeight: '300px',
                overflow: 'auto',
                fontFamily: 'monospace',
                fontSize: '0.875rem'
              }}
            >
              {gameLog.length > 0 ? (
                gameLog.map((log, index) => (
                  <div key={index}>{log}</div>
                ))
              ) : (
                <div>No game events yet...</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
