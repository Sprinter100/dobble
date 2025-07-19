import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { CurrentTurnButtons } from './CurrentTurnButtons';

interface GameState {
  players: Array<{
    id: string;
    name: string;
    hand: string[];
    isReady: boolean;
    turns: number;
    timeoutDate: number;
  }>;
  currentTurn: string[];
  state: string;
  meta: {
    maxTimeoutMs: number;
    maxPlayerTurns: number;
  };
}

export function GameSection() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [clentId, setClientid] = useState('');
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [firstSelectedHandType, setFirstSelectedHandType] = useState('');
  const [firstSelectedLetter, setFirstSelectedLetter] = useState('');

  const maxTimeoutMs = gameState?.meta.maxTimeoutMs || 0;
  const currentPlayer = gameState?.players.find((player) => player.id === clentId);
  const hasTimeoutDate = !!currentPlayer?.timeoutDate && Date.now() - currentPlayer?.timeoutDate < maxTimeoutMs;
  const isReady = currentPlayer?.isReady;

  useEffect(() => {
    let timeoutId: number;

    if (hasTimeoutDate) {
      setIsTimedOut(true);

      timeoutId = setTimeout(() => setIsTimedOut(false), maxTimeoutMs);
    }

    return () => clearTimeout(timeoutId);
  }, [hasTimeoutDate, maxTimeoutMs])

  const handleReady = () => {
    if (socket) {
      socket.emit('playerReady');
    }
  };

  const handleLetterClick = (handType: string, letter: string) => {
    if (!firstSelectedHandType || handType === firstSelectedHandType) {
      setFirstSelectedHandType(handType);
      setFirstSelectedLetter(letter);

      return;
    }

    if (socket) {
      socket.emit('move', firstSelectedLetter, letter);
      setFirstSelectedHandType('');
      setFirstSelectedLetter('');
    }
  }

  useEffect(() => {
    const newSocket = io('/', {
      withCredentials: true
    });

    newSocket.on('connect', () => {
      console.log('Connected to game server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected');
      setIsConnected(false);
    });

    newSocket.on('playerMove', (data: string) => {
      console.log(data);
    });

    newSocket.on('clientId', (clientId: string) => {
      handleClientId(clientId);
    });

    newSocket.on('gameState', (data: GameState) => {
      handleGameState(data);
    });

    newSocket.on('events', (data: unknown) => {
      console.log('event', data);
    });

    newSocket.on('exception', (data: unknown) => {
      console.log('exception', data);
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleGameState = (data: GameState) => {
    console.log('gameStateChange', data);
    setGameState(data);
  }

  const handleClientId = (clientId: string) => {
    console.log(clientId);
    setClientid(clientId)
  }

  return (
    <div className="row">
      <div className="col-12">
        <div className="card bg-dark border-secondary mb-4">
          <div className="card-body">
            <h2 className="h4 mb-3">Game Controls</h2>
            <div className="d-flex gap-2">
              <button
                onClick={handleReady}
                className="btn btn-success"
                disabled={!isConnected || isReady}
              >
                Ready
              </button>
              <div className="ms-auto">
                <span className={`badge ${isConnected ? 'bg-success' : 'bg-danger'}`}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
            {(isReady && gameState?.state === 'WAITING_FOR_PLAYERS') && (
              <div className="mt-3 text-warning">Waiting for other players</div>
            )}
          </div>
        </div>

        {isReady && gameState?.state !== 'WAITING_FOR_PLAYERS' ? (
          <>
            <div className="card bg-dark border-secondary mb-4">
              <div className="card-body">
                <h2 className="h4 mb-3">Current Turn</h2>
                <div className="d-flex gap-2">
                  <CurrentTurnButtons
                    type="gameHand"
                    isDisabled={isTimedOut}
                    selectedLetter={firstSelectedHandType === "gameHand" ?  firstSelectedLetter : undefined}
                    letters={gameState?.currentTurn ?? []}
                    onLetterClick={handleLetterClick}
                  />
                </div>
              </div>
            </div>

            <div className="card bg-dark border-secondary mb-4">
              <div className="card-body">
                <h2 className="h4 mb-3">Dealt Hand</h2>
                <div className="d-flex gap-2">
                  <CurrentTurnButtons
                    type="playerHand"
                    selectedLetter={firstSelectedHandType === "playerHand" ?  firstSelectedLetter : undefined}
                    isDisabled={isTimedOut}
                    letters={currentPlayer?.hand ?? []}
                    onLetterClick={handleLetterClick}
                  />
                </div>
              </div>
            </div>
          </>
        ) : null}

        {isReady && gameState?.state === 'RESULTS' ? (
          <div className="card bg-dark border-secondary mb-4">
            <div className="card-body">
              <h2 className="h4 mb-3">Game Results</h2>
              {(() => {
                const currentPlayerTurns = currentPlayer?.turns ?? 0;
                const otherPlayers = gameState?.players.filter(player => player.id !== clentId) ?? [];
                const isWinner = currentPlayerTurns === 0 && otherPlayers.every(player => player.turns > 0);

                return (
                  <>
                    <div className={`alert ${isWinner ? 'alert-success' : 'alert-danger'} mb-3 bg-dark border-secondary`}>
                      <h5 className="alert-heading text-light text-center mb-0">
                        {isWinner ? '🎉 You Won! 🎉' : '😔 Game Over - You Lost'}
                      </h5>
                    </div>

                    <div className="mt-3">
                      <h6>Other Players:</h6>
                      <ul className="list-group list-group-flush bg-transparent">
                        {otherPlayers.map((player) => (
                          <li key={player.id} className="list-group-item bg-transparent text-light border-secondary">
                            <strong>{player.name}</strong>: {player.turns} turns remaining
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
