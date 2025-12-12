import { useEffect, useRef } from 'react';
import { GameState } from '../../types';

interface LocalGameCanvasProps {
  gameState: GameState;
  width: number;
  height: number;
}

export function LocalGameCanvas({ gameState, width, height }: LocalGameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    // Draw center line
    ctx.strokeStyle = '#444';
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw ball
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(
      gameState.ball.position.x,
      gameState.ball.position.y,
      gameState.ball.radius,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Draw paddle 1
    ctx.fillStyle = '#4ade80';
    ctx.fillRect(
      gameState.paddle1.position.x,
      gameState.paddle1.position.y,
      gameState.paddle1.size.width,
      gameState.paddle1.size.height
    );

    // Draw paddle 2
    ctx.fillStyle = '#f87171';
    ctx.fillRect(
      gameState.paddle2.position.x,
      gameState.paddle2.position.y,
      gameState.paddle2.size.width,
      gameState.paddle2.size.height
    );

    // Draw scores
    ctx.font = '48px monospace';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText(gameState.score.player1.toString(), width / 4, 60);
    ctx.fillText(gameState.score.player2.toString(), (width * 3) / 4, 60);

    // Draw winner message
    if (gameState.winner) {
      ctx.font = 'bold 32px monospace';
      ctx.fillStyle = gameState.winner === 'player1' ? '#4ade80' : '#f87171';
      ctx.fillText(
        gameState.winner === 'player1' ? 'PLAYER 1 WINS!' : 'PLAYER 2 WINS!',
        width / 2,
        height / 2
      );
    }
  }, [gameState, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="border-2 sm:border-4 border-gray-700 rounded-lg shadow-2xl w-full h-auto"
      style={{ maxWidth: '100%', height: 'auto' }}
    />
  );
}
