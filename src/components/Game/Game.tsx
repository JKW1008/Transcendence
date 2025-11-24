import { useRef, useCallback } from 'react';
import { useGameLoop } from '../../hooks/useGameLoop';
import { useKeyboard } from '../../hooks/useKeyboard';
import { GameCanvas } from './GameCanvas';

export function Game() {
  const { keysPressed } = useKeyboard();
  const { gameState, startGame, pauseGame, resetGame, movePaddleByDelta, config, orientation } = useGameLoop({
    keysPressed,
  });

  const isVertical = orientation === 'vertical';
  const lastTouchRef = useRef<{ x: number; y: number; player: 1 | 2 } | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (!gameState.isPlaying || gameState.winner) return;

    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const relativeX = touch.clientX - rect.left;
    const relativeY = touch.clientY - rect.top;

    // Determine which player based on touch position
    let player: 1 | 2;
    if (isVertical) {
      // Vertical mode: bottom half = Player 1, top half = Player 2
      player = relativeY > rect.height / 2 ? 1 : 2;
    } else {
      // Horizontal mode: left half = Player 1, right half = Player 2
      player = relativeX < rect.width / 2 ? 1 : 2;
    }

    lastTouchRef.current = { x: touch.clientX, y: touch.clientY, player };
  }, [gameState.isPlaying, gameState.winner, isVertical]);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (!lastTouchRef.current || !gameState.isPlaying) return;

    const touch = e.touches[0];
    const { x: lastX, y: lastY, player } = lastTouchRef.current;

    // Calculate delta based on orientation
    const delta = isVertical
      ? touch.clientX - lastX  // Horizontal movement for vertical mode
      : touch.clientY - lastY; // Vertical movement for horizontal mode

    movePaddleByDelta(player, delta);

    lastTouchRef.current = { x: touch.clientX, y: touch.clientY, player };
  }, [gameState.isPlaying, isVertical, movePaddleByDelta]);

  const handleTouchEnd = useCallback(() => {
    lastTouchRef.current = null;
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4 sm:p-8">
      <div className="flex flex-col items-center gap-4 sm:gap-8 w-full max-w-7xl">
        {/* Title */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white mb-2 sm:mb-4">
          PONG
        </h1>

        {/* Game Canvas */}
        <div
          className="relative touch-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <GameCanvas
            gameState={gameState}
            width={config.canvasWidth}
            height={config.canvasHeight}
          />

          {/* Winner Overlay */}
          {gameState.winner && (
            <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center rounded-lg">
              <div className="text-center px-4">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4">
                  {gameState.winner === 'player1' ? 'Player 1' : 'Player 2'} Wins!
                </h2>
                <p className="text-xl sm:text-2xl text-gray-300 mb-4 sm:mb-6">
                  {gameState.score.player1} - {gameState.score.player2}
                </p>
                <button
                  onClick={resetGame}
                  className="px-6 sm:px-8 py-2 sm:py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors text-sm sm:text-base"
                >
                  Play Again
                </button>
              </div>
            </div>
          )}

          {/* Start Overlay */}
          {!gameState.isPlaying && !gameState.winner && (
            <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center rounded-lg">
              <div className="text-center px-4">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">
                  Ready to Play?
                </h2>
                <button
                  onClick={startGame}
                  className="px-6 sm:px-8 py-2 sm:py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors text-sm sm:text-base"
                >
                  Start Game
                </button>
              </div>
            </div>
          )}
        </div>


        {/* Controls Info */}
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-16 text-white">
          <div className="text-center">
            <h3 className="text-lg sm:text-xl font-semibold mb-2">
              Player 1 {isVertical ? '(Bottom)' : '(Left)'}
            </h3>
            <div className="text-xs sm:text-sm text-gray-300">
              {isVertical ? (
                <>
                  <p>A/D or Swipe</p>
                </>
              ) : (
                <>
                  <p>W/S or Swipe</p>
                </>
              )}
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-lg sm:text-xl font-semibold mb-2">
              Player 2 {isVertical ? '(Top)' : '(Right)'}
            </h3>
            <div className="text-xs sm:text-sm text-gray-300">
              {isVertical ? (
                <>
                  <p>←/→ or Swipe</p>
                </>
              ) : (
                <>
                  <p>↑/↓ or Swipe</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Game Controls */}
        {gameState.isPlaying && !gameState.winner && (
          <div className="flex gap-4">
            <button
              onClick={pauseGame}
              className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg transition-colors"
            >
              Pause
            </button>
            <button
              onClick={resetGame}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
            >
              Reset
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
