import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
import { OnlineGameCanvas } from '../components/Game/OnlineGameCanvas';

// 환경 변수 가져오기 (Vite 방식)
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';
console.log('🌐 Socket URL:', SOCKET_URL);

export function OnlineGame() {
  const [username, setUsername] = useState('');
  const [userReady, setUserReady] = useState(false);
  const [userData, setUserData] = useState<{ username: string; avatar: string } | null>(null);

  const {
    gameState,
    matchStatus,
    matchInfo,
    gameResult,
    error,
    isConnected,
    joinQueue,
    movePaddle,
    rematch,
    leaveQueue,
  } = useSocket(userData, { 
    autoConnect: true,
    serverUrl: SOCKET_URL // 수정된 부분
  });

  // 키보드 입력 처리 - 키 상태 추적
  useEffect(() => {
    const keysPressed = new Set<string>();
    const gameKeys = new Set([
      'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
      'w', 'W', 's', 'S', 'a', 'A', 'd', 'D'
    ]);

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default behavior for game keys (prevent scrolling)
      if (gameKeys.has(e.key)) {
        e.preventDefault();
      }

      // Only handle input when playing
      if (matchStatus !== 'playing') return;

      // Prevent key repeat
      if (keysPressed.has(e.key)) return;
      keysPressed.add(e.key);

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        movePaddle('up', true);
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        movePaddle('down', true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // Prevent default behavior for game keys
      if (gameKeys.has(e.key)) {
        e.preventDefault();
      }

      keysPressed.delete(e.key);

      if (matchStatus !== 'playing') return;

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        movePaddle('up', false);
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        movePaddle('down', false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [matchStatus, movePaddle]);

  // 터치 컨트롤 (모바일)
  const handleTouchStartUp = useCallback(() => {
    if (matchStatus === 'playing') {
      movePaddle('up', true);
    }
  }, [matchStatus, movePaddle]);

  const handleTouchEndUp = useCallback(() => {
    if (matchStatus === 'playing') {
      movePaddle('up', false);
    }
  }, [matchStatus, movePaddle]);

  const handleTouchStartDown = useCallback(() => {
    if (matchStatus === 'playing') {
      movePaddle('down', true);
    }
  }, [matchStatus, movePaddle]);

  const handleTouchEndDown = useCallback(() => {
    if (matchStatus === 'playing') {
      movePaddle('down', false);
    }
  }, [matchStatus, movePaddle]);

  const handleStartGame = () => {
    if (username.trim()) {
      const newUserData = {
        username: username.trim(),
        avatar: '👤'
      };
      console.log('👤 Setting user data:', newUserData);
      setUserData(newUserData);
      setUserReady(true);
    }
  };

  const handleRematch = () => {
    console.log('🔄 Rematch requested');
    rematch();
    // 잠시 후 자동으로 큐에 참가
    setTimeout(() => {
      if (userData) {
        joinQueue();
      }
    }, 500);
  };

  const handleLeave = () => {
    console.log('🚪 Leaving game');
    leaveQueue();
    setUserReady(false);
    setUserData(null);
    setUsername('');
  };

  // 유저 이름 입력 화면
  if (!userReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md w-full">
          <h1 className="text-5xl sm:text-6xl font-bold text-white mb-4">
            Online Match
          </h1>
          <p className="text-lg text-gray-300 mb-8">
            Enter your username to find an opponent
          </p>

          <div className="space-y-4">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleStartGame()}
              placeholder="Enter username..."
              className="w-full px-4 py-3 bg-gray-800 text-white border-2 border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none text-lg"
              maxLength={20}
              autoFocus
            />

            <div className="text-sm text-gray-400 mb-2">
              Connection status: {isConnected ? '✅ Connected' : '❌ Disconnected'}
              {SOCKET_URL && ` (Server: ${SOCKET_URL})`}
            </div>

            <button
              onClick={handleStartGame}
              disabled={!username.trim() || !isConnected}
              className="w-full px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors text-lg"
            >
              {isConnected ? 'Continue' : 'Connecting...'}
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

  // 에러 표시
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-gray-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h2 className="text-3xl font-bold text-white mb-4">Error</h2>
          <p className="text-lg text-gray-300 mb-4">{error}</p>
          <div className="text-sm text-gray-400 mb-8">
            Status: {matchStatus} | Connected: {isConnected ? 'Yes' : 'No'}
            <br />
            Server: {SOCKET_URL}
          </div>
          <button
            onClick={handleLeave}
            className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors text-lg"
          >
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  // 매치 찾기 화면 (idle)
  if (matchStatus === 'idle') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
            Welcome, {userData?.username}!
          </h1>
          <p className="text-lg text-gray-300 mb-8">Ready to play?</p>

          <div className="space-y-4">
            <button
              onClick={joinQueue}
              disabled={!isConnected}
              className="px-12 py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold rounded-lg transition-colors text-xl shadow-lg"
            >
              {isConnected ? 'Find Match' : 'Connecting...'}
            </button>

            <div className="text-sm text-gray-400">
              Status: {matchStatus} | Connected: {isConnected ? '✅' : '❌'}
              <br />
              Server: {SOCKET_URL}
            </div>

            <button
              onClick={handleLeave}
              className="block mx-auto px-8 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Leave
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 대기 중 화면 (waiting)
  if (matchStatus === 'waiting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="mb-8">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Finding opponent...
          </h2>
          <p className="text-lg text-gray-300 mb-8">
            Please wait while we match you with another player
          </p>
          
          <div className="text-sm text-gray-400 mb-4">
            Status: {matchStatus} | Connected: {isConnected ? '✅' : '❌'}
            <br />
            Server: {SOCKET_URL}
          </div>

          <button
            onClick={handleLeave}
            className="px-8 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Cancel Matchmaking
          </button>
        </div>
      </div>
    );
  }

  // 매칭 완료 화면 (matched)
  if (matchStatus === 'matched' && matchInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Opponent Found!
          </h2>
          <div className="mb-4 p-4 bg-gray-800 rounded-lg">
            <p className="text-2xl text-gray-300 mb-2">
              {matchInfo.opponent.username} {matchInfo.opponent.avatar}
            </p>
            <p className="text-lg text-gray-400">
              You are Player {matchInfo.playerNumber}
            </p>
          </div>
          <div className="text-4xl font-bold text-green-500 animate-pulse mb-4">
            Starting Game...
          </div>
          <div className="text-sm text-gray-400">
            Status: {matchStatus} | Room: {matchInfo.roomId}
            <br />
            Server: {SOCKET_URL}
          </div>
        </div>
      </div>
    );
  }

  // 게임 진행 중 (playing)
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
          <div className="text-xs text-gray-500 mt-2">
            First to {gameState.winningScore} points wins
          </div>
        </div>

        <OnlineGameCanvas gameState={gameState} playerNumber={matchInfo.playerNumber} />

        {/* 터치 컨트롤 (모바일) */}
        <div className="mt-4 flex gap-4 sm:hidden">
          <button
            onTouchStart={handleTouchStartUp}
            onTouchEnd={handleTouchEndUp}
            className="px-8 py-4 bg-blue-600 active:bg-blue-700 text-white font-bold rounded-lg text-xl"
          >
            ↑ UP
          </button>
          <button
            onTouchStart={handleTouchStartDown}
            onTouchEnd={handleTouchEndDown}
            className="px-8 py-4 bg-blue-600 active:bg-blue-700 text-white font-bold rounded-lg text-xl"
          >
            ↓ DOWN
          </button>
        </div>

        {/* 키보드 안내 */}
        <p className="mt-4 text-gray-400 text-sm hidden sm:block">
          Use ↑↓ or W/S keys to move your paddle
        </p>
        
        <div className="text-xs text-gray-500 mt-4">
          Status: {matchStatus} | Room: {matchInfo.roomId}
          <br />
          Server: {SOCKET_URL}
        </div>
      </div>
    );
  }

  // 게임 종료 화면 (ended)
  if (matchStatus === 'ended' && gameResult && matchInfo) {
    const isWinner =
      (matchInfo.playerNumber === 1 && gameResult.winner === 'player1') ||
      (matchInfo.playerNumber === 2 && gameResult.winner === 'player2');

    return (
      <div
        className={`min-h-screen bg-gradient-to-br ${
          isWinner
            ? 'from-gray-900 via-green-900 to-gray-900'
            : 'from-gray-900 via-red-900 to-gray-900'
        } flex items-center justify-center p-4`}
      >
        <div className="text-center">
          <h2 className="text-5xl sm:text-6xl font-bold text-white mb-4">
            {isWinner ? '🎉 Victory!' : '😔 Defeat'}
          </h2>

          <div className="mb-8">
            <p className="text-2xl text-gray-300 mb-4">Final Score</p>
            <div className="flex items-center justify-center gap-8">
              <div>
                <p className="text-gray-400">
                  {matchInfo.playerNumber === 1 ? 'YOU' : matchInfo.opponent.username}
                </p>
                <p className="text-4xl font-bold text-white">
                  {gameResult.finalScore.player1}
                </p>
              </div>
              <div className="text-gray-500 text-2xl">-</div>
              <div>
                <p className="text-gray-400">
                  {matchInfo.playerNumber === 2 ? 'YOU' : matchInfo.opponent.username}
                </p>
                <p className="text-4xl font-bold text-white">
                  {gameResult.finalScore.player2}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleRematch}
              className="px-12 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors text-xl"
            >
              Play Again
            </button>

            <Link
              to="/"
              className="block px-12 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors text-xl"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 로딩 상태
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
        <p className="text-white mt-4">Loading...</p>
        <p className="text-gray-400 text-sm mt-2">
          Status: {matchStatus} | Connected: {isConnected ? 'Yes' : 'No'}
          <br />
          Server: {SOCKET_URL}
        </p>
        {error && <p className="text-red-400 mt-2">{error}</p>}
      </div>
    </div>
  );
}