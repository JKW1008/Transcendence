import { useEffect, useRef } from 'react';
import { GameState } from '../../types';

interface GameCanvasProps {
  gameState: GameState;
  width: number;
  height: number;
}

export function GameCanvas({ gameState, width, height }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isVertical = gameState.orientation === 'vertical';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    // Draw center line based on orientation
    ctx.strokeStyle = '#444';
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    if (isVertical) {
      // Horizontal center line for vertical mode
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
    } else {
      // Vertical center line for horizontal mode
      ctx.moveTo(width / 2, 0);
      ctx.lineTo(width / 2, height);
    }
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

    // Draw paddle 1 (left in horizontal, bottom in vertical)
    ctx.fillStyle = '#fff';
    ctx.fillRect(
      gameState.paddle1.position.x,
      gameState.paddle1.position.y,
      gameState.paddle1.size.width,
      gameState.paddle1.size.height
    );

    // Draw paddle 2 (right in horizontal, top in vertical)
    ctx.fillRect(
      gameState.paddle2.position.x,
      gameState.paddle2.position.y,
      gameState.paddle2.size.width,
      gameState.paddle2.size.height
    );

    // Draw scores based on orientation
    const fontSize = isVertical ? Math.max(24, width * 0.08) : 48;
    ctx.font = `${fontSize}px monospace`;
    ctx.textAlign = 'center';

    if (isVertical) {
      // Vertical mode: Player 1 score on bottom half, Player 2 on top half
      ctx.fillText(gameState.score.player2.toString(), width / 2, height / 4);
      ctx.fillText(gameState.score.player1.toString(), width / 2, (height * 3) / 4);
    } else {
      // Horizontal mode: Player 1 on left, Player 2 on right
      ctx.fillText(gameState.score.player1.toString(), width / 4, 60);
      ctx.fillText(gameState.score.player2.toString(), (width * 3) / 4, 60);
    }

  }, [gameState, width, height, isVertical]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="border-2 sm:border-4 border-gray-700 rounded-lg shadow-2xl w-full h-auto"
      style={{ maxWidth: `${width}px`, maxHeight: `${height}px` }}
    />
  );
}
