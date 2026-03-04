import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { OnlineGameCanvas } from '../components/Game/OnlineGameCanvas';
import { ServerGameState } from '../hooks/useSocket';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

interface TournamentInfo {
  tournamentId: string;
  playersJoined: number;
  playersNeeded: number;
  createdAt: number;
}

interface MatchInfo {
  roomId: string;
  playerNumber: 1 | 2;
  opponent: {
    username: string;
    avatar: string;
  };
  isTournament?: boolean;
  tournamentId?: string;
  matchId?: string;
}

interface TournamentRankings {
  first: { id: string; username: string; avatar: string } | null;
  second: { id: string; username: string; avatar: string } | null;
  third: { id: string; username: string; avatar: string } | null;
  fourth: { id: string; username: string; avatar: string } | null;
}

type MatchStatus = 'idle' | 'waiting' | 'matched' | 'playing' | 'ended';

export function Tournament() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [username, setUsername] = useState('');
  const [userReady, setUserReady] = useState(false);
  const [tournaments, setTournaments] = useState<TournamentInfo[]>([]);
  const [joinedTournament, setJoinedTournament] = useState<string | null>(null);

  // Game states
  const [matchStatus, setMatchStatus] = useState<MatchStatus>('idle');
  const [matchInfo, setMatchInfo] = useState<MatchInfo | null>(null);
  const [gameState, setGameState] = useState<ServerGameState | null>(null);

  // Tournament results
  const [tournamentComplete, setTournamentComplete] = useState(false);
  const [rankings, setRankings] = useState<TournamentRankings | null>(null);

  // Socket connection
  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
    });

    newSocket.on('connect', () => {
      console.log('✅ Connected to tournament server');
    });

    newSocket.on('tournament:created', (data) => {
      if (data.success) {
        console.log('🏆 Tournament created:', data.tournamentId);
        // Auto-join the tournament you created
        newSocket.emit('tournament:join', {
          tournamentId: data.tournamentId,
          userData: {
            username: username.trim(),
            avatar: '👤'
          }
        });
      }
    });

    newSocket.on('tournament:join-result', (result) => {
      if (result.success) {
        console.log('✅ Joined tournament');
        // Will receive tournament:update with full state
      } else {
        console.error('❌ Failed to join:', result.message);
        alert(result.message);
      }
    });

    newSocket.on('tournament:list-result', (list) => {
      console.log('📋 Available tournaments:', list);
      setTournaments(list);
    });

    newSocket.on('tournament:update', (state) => {
      console.log('🔄 Tournament updated:', state);
      setJoinedTournament(state.tournamentId);
    });

    newSocket.on('tournament:started', (state) => {
      console.log('🎮 Tournament started!', state);
    });

    newSocket.on('tournament:match-started', (data) => {
      console.log('🎯 Match started:', data);
    });

    // Game events
    newSocket.on('game:matched', (data: MatchInfo) => {
      console.log('🎯 Matched for game:', data);
      setMatchStatus('matched');
      setMatchInfo(data);
    });

    newSocket.on('game:update', (state: ServerGameState) => {
      setGameState(state);
      if (state.isPlaying && state.winner === null) {
        setMatchStatus('playing');
      }
    });

    newSocket.on('game:end', (result) => {
      console.log('🏁 Game ended:', result);
      setMatchStatus('ended');
      // After game ends, wait for next match or tournament completion
      setTimeout(() => {
        setMatchStatus('waiting');
        setGameState(null);
        setMatchInfo(null);
      }, 3000);
    });

    newSocket.on('tournament:match-complete', (data) => {
      console.log('✅ Match complete:', data);
    });

    newSocket.on('tournament:round-complete', (data) => {
      console.log('📊 Round complete:', data);
    });

    newSocket.on('tournament:player-forfeited', (data) => {
      console.log('🚫 Player forfeited:', data);
      // Only show alert if currently in this match
      if (matchInfo && matchInfo.matchId === data.matchId) {
        alert(`${data.forfeiter.username} forfeited! ${data.winner.username} advances by forfeit.`);
      }
    });

    newSocket.on('tournament:completed', (state) => {
      console.log('🏆 Tournament completed!', state);
      setRankings(state.rankings);
      setTournamentComplete(true);
      setMatchStatus('idle');
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [username]);

  // Load tournaments when ready
  useEffect(() => {
    if (socket && userReady && !joinedTournament) {
      socket.emit('tournament:list');
      // Refresh list every 3 seconds
      const interval = setInterval(() => {
        socket.emit('tournament:list');
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [socket, userReady, joinedTournament]);

  // Keyboard input handling
  useEffect(() => {
    if (!socket || matchStatus !== 'playing') return;

    const gameKeys = new Set([
      'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
      'w', 'W', 's', 'S', 'a', 'A', 'd', 'D'
    ]);

    const keysPressed = new Set<string>();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameKeys.has(e.key)) {
        e.preventDefault();
      }

      if (keysPressed.has(e.key)) return;
      keysPressed.add(e.key);

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        socket.emit('paddle:keydown', { direction: 'up' });
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        socket.emit('paddle:keydown', { direction: 'down' });
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (gameKeys.has(e.key)) {
        e.preventDefault();
      }

      keysPressed.delete(e.key);

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        socket.emit('paddle:keyup', { direction: 'up' });
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        socket.emit('paddle:keyup', { direction: 'down' });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [socket, matchStatus]);

  const handleStartGame = () => {
    if (username.trim()) {
      setUserReady(true);
    }
  };

  const handleCreateTournament = () => {
    if (socket) {
      socket.emit('tournament:create', { minPlayers: 4 });
    }
  };

  const handleJoinTournament = (tournamentId: string) => {
    if (socket && username) {
      socket.emit('tournament:join', {
        tournamentId,
        userData: {
          username: username.trim(),
          avatar: '👤'
        }
      });
    }
  };

  // Username input screen
  if (!userReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md w-full">
          <h1 className="text-5xl sm:text-6xl font-bold text-white mb-4">
            🏆 Tournament
          </h1>
          <p className="text-lg text-gray-300 mb-8">
            Enter your username to join a tournament
          </p>

          <div className="space-y-4">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleStartGame()}
              placeholder="Enter username..."
              className="w-full px-4 py-3 bg-gray-800 text-white border-2 border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none text-lg"
              maxLength={20}
              autoFocus
            />

            <button
              onClick={handleStartGame}
              disabled={!username.trim()}
              className="w-full px-8 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors text-lg"
            >
              Continue
            </button>

            <Link
              to="/"
              className="block px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors text-lg"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Tournament complete - show rankings
  if (tournamentComplete && rankings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-gray-800 rounded-lg p-8">
          <h1 className="text-4xl font-bold text-white text-center mb-8">
            🏆 토너먼트 결과
          </h1>

          <div className="space-y-4">
            {/* 1st Place */}
            {rankings.first && (
              <div className="bg-gradient-to-r from-yellow-600 to-yellow-500 rounded-lg p-6 flex items-center gap-4">
                <div className="text-5xl">🥇</div>
                <div className="flex-1">
                  <div className="text-sm text-yellow-100">1등</div>
                  <div className="text-2xl font-bold text-white">{rankings.first.username}</div>
                </div>
              </div>
            )}

            {/* 2nd Place */}
            {rankings.second && (
              <div className="bg-gradient-to-r from-gray-400 to-gray-300 rounded-lg p-5 flex items-center gap-4">
                <div className="text-4xl">🥈</div>
                <div className="flex-1">
                  <div className="text-sm text-gray-700">2등</div>
                  <div className="text-xl font-bold text-gray-900">{rankings.second.username}</div>
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {rankings.third && (
              <div className="bg-gradient-to-r from-orange-700 to-orange-600 rounded-lg p-4 flex items-center gap-4">
                <div className="text-3xl">🥉</div>
                <div className="flex-1">
                  <div className="text-sm text-orange-100">3등</div>
                  <div className="text-lg font-bold text-white">{rankings.third.username}</div>
                </div>
              </div>
            )}

            {/* 4th Place */}
            {rankings.fourth && (
              <div className="bg-gray-700 rounded-lg p-4 flex items-center gap-4">
                <div className="text-3xl">4️⃣</div>
                <div className="flex-1">
                  <div className="text-sm text-gray-400">4등</div>
                  <div className="text-lg font-semibold text-gray-200">{rankings.fourth.username}</div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 flex gap-4">
            <Link
              to="/"
              className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors text-center"
            >
              홈으로
            </Link>
            <button
              onClick={() => {
                setTournamentComplete(false);
                setRankings(null);
                setJoinedTournament(null);
              }}
              className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
            >
              다시 참가하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Game playing screen
  if (matchStatus === 'playing' && gameState && matchInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex flex-col items-center justify-center p-4">
        <div className="mb-4 text-center">
          <div className="flex items-center justify-center gap-8 mb-2">
            <div className="text-white">
              <p className="text-sm text-gray-400">
                {matchInfo.playerNumber === 1 ? 'YOU' : matchInfo.opponent.username}
              </p>
              <p className="text-2xl font-bold">{gameState.paddle1.score}</p>
            </div>
            <div className="text-gray-400 text-xl">VS</div>
            <div className="text-white">
              <p className="text-sm text-gray-400">
                {matchInfo.playerNumber === 2 ? 'YOU' : matchInfo.opponent.username}
              </p>
              <p className="text-2xl font-bold">{gameState.paddle2.score}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500">🏆 Tournament Match</p>
        </div>

        <OnlineGameCanvas gameState={gameState} playerNumber={matchInfo.playerNumber} />

        <p className="mt-4 text-gray-400 text-sm">
          Use ↑↓ or W/S keys to move your paddle
        </p>
      </div>
    );
  }

  // Waiting between matches
  if (matchStatus === 'waiting' || matchStatus === 'matched' || matchStatus === 'ended') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            {matchStatus === 'ended' ? 'Match Complete!' : 'Tournament In Progress'}
          </h1>
          <p className="text-gray-300 mb-8">
            {matchStatus === 'ended'
              ? 'Waiting for next match...'
              : matchStatus === 'matched'
              ? 'Match starting soon...'
              : 'Preparing next round...'}
          </p>
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mb-4"></div>
        </div>
      </div>
    );
  }

  // Tournament lobby
  if (joinedTournament) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            Tournament Lobby
          </h1>
          <p className="text-gray-300 mb-8">
            Waiting for players...
          </p>
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mb-4"></div>
          <p className="text-sm text-gray-400">
            Tournament ID: {joinedTournament.slice(-8)}
          </p>
        </div>
      </div>
    );
  }

  // Tournament list
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">
            🏆 Tournament Mode
          </h1>
          <p className="text-gray-300">
            Welcome, {username}!
          </p>
        </div>

        {/* Create Tournament Button */}
        <div className="mb-8 text-center">
          <button
            onClick={handleCreateTournament}
            className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors text-xl shadow-lg"
          >
            Create New Tournament (4 Players)
          </button>
        </div>

        {/* Tournament List */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-4">
            Available Tournaments
          </h2>

          {tournaments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">No tournaments available</p>
              <p className="text-sm text-gray-500">Create one to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tournaments.map((tournament) => (
                <div
                  key={tournament.tournamentId}
                  className="bg-gray-700 rounded-lg p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="text-white font-semibold">
                      Tournament #{tournament.tournamentId.slice(-8)}
                    </p>
                    <p className="text-sm text-gray-400">
                      Players: {tournament.playersJoined}/{tournament.playersNeeded}
                    </p>
                  </div>
                  <button
                    onClick={() => handleJoinTournament(tournament.tournamentId)}
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    Join
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <Link
            to="/"
            className="inline-block px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
