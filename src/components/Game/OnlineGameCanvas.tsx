import { useEffect, useRef } from 'react';
import { ServerGameState } from '../../hooks/useSocket';

interface OnlineGameCanvasProps {
  gameState: ServerGameState;
  playerNumber: 1 | 2;
}

export function OnlineGameCanvas({ gameState, playerNumber }: OnlineGameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { canvas, ball, paddle1, paddle2 } = gameState;

  useEffect(() => {
    const canvasElement = canvasRef.current;
    if (!canvasElement) return;

    const ctx = canvasElement.getContext('2d');
    if (!ctx) return;

    // Debug: Log paddle positions
    // console.log(`🎨 Rendering: paddle1.y=${paddle1.y}, paddle2.y=${paddle2.y}`);

    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw center line
    ctx.strokeStyle = '#444';
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw ball
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();

    // Draw paddle 1 (left)
    ctx.fillStyle = playerNumber === 1 ? '#4ade80' : '#fff'; // Green for local player
    ctx.fillRect(paddle1.x, paddle1.y, paddle1.width, paddle1.height);

    // Draw paddle 2 (right)
    ctx.fillStyle = playerNumber === 2 ? '#4ade80' : '#fff'; // Green for local player
    ctx.fillRect(paddle2.x, paddle2.y, paddle2.width, paddle2.height);

    // Draw scores
    ctx.font = '48px monospace';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText(paddle1.score.toString(), canvas.width / 4, 60);
    ctx.fillText(paddle2.score.toString(), (canvas.width * 3) / 4, 60);

    // Draw player indicator
    ctx.font = '20px monospace';
    ctx.fillStyle = '#4ade80';
    if (playerNumber === 1) {
      ctx.textAlign = 'left';
      ctx.fillText('YOU', 20, canvas.height - 20);
    } else {
      ctx.textAlign = 'right';
      ctx.fillText('YOU', canvas.width - 20, canvas.height - 20);
    }
  }, [gameState, canvas.width, canvas.height, ball, paddle1, paddle2, playerNumber]);

  return (
    <canvas
      ref={canvasRef}
      width={canvas.width}
      height={canvas.height}
      className="border-2 sm:border-4 border-gray-700 rounded-lg shadow-2xl w-full h-auto"
      style={{ maxWidth: `${canvas.width}px`, maxHeight: `${canvas.height}px` }}
    />
  );
}
