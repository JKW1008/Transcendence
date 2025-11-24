import { GameState, GameConfig, Orientation } from '../types';

export class GameEngine {
  private config: GameConfig;
  public state: GameState;

  constructor(config: GameConfig) {
    this.config = config;
    this.state = this.getInitialState();
  }

  private getInitialState(): GameState {
    const { canvasWidth, canvasHeight, paddleWidth, paddleHeight, ballRadius, paddleSpeed, orientation } = this.config;

    if (orientation === 'vertical') {
      // Vertical mode: paddles at top and bottom, move horizontally
      // In vertical mode, paddle is horizontal: width=paddleHeight (long side), height=paddleWidth (short side)
      const horizontalPaddleWidth = paddleHeight; // The long side becomes width
      const horizontalPaddleHeight = paddleWidth; // The short side becomes height

      return {
        ball: {
          position: { x: canvasWidth / 2, y: canvasHeight / 2 },
          velocity: { x: (Math.random() - 0.5) * 6, y: 5 },
          radius: ballRadius,
        },
        paddle1: {
          // Bottom paddle (Player 1)
          position: {
            x: canvasWidth / 2 - horizontalPaddleWidth / 2,
            y: canvasHeight - 20 - horizontalPaddleHeight
          },
          size: { width: horizontalPaddleWidth, height: horizontalPaddleHeight },
          speed: paddleSpeed,
        },
        paddle2: {
          // Top paddle (Player 2)
          position: {
            x: canvasWidth / 2 - horizontalPaddleWidth / 2,
            y: 20
          },
          size: { width: horizontalPaddleWidth, height: horizontalPaddleHeight },
          speed: paddleSpeed,
        },
        score: { player1: 0, player2: 0 },
        isPlaying: false,
        winner: null,
        orientation,
      };
    } else {
      // Horizontal mode: paddles at left and right, move vertically
      return {
        ball: {
          position: { x: canvasWidth / 2, y: canvasHeight / 2 },
          velocity: { x: 5, y: (Math.random() - 0.5) * 6 },
          radius: ballRadius,
        },
        paddle1: {
          position: { x: 20, y: canvasHeight / 2 - paddleHeight / 2 },
          size: { width: paddleWidth, height: paddleHeight },
          speed: paddleSpeed,
        },
        paddle2: {
          position: { x: canvasWidth - 20 - paddleWidth, y: canvasHeight / 2 - paddleHeight / 2 },
          size: { width: paddleWidth, height: paddleHeight },
          speed: paddleSpeed,
        },
        score: { player1: 0, player2: 0 },
        isPlaying: false,
        winner: null,
        orientation,
      };
    }
  }

  public reset(): void {
    this.state = this.getInitialState();
  }

  public start(): void {
    this.state.isPlaying = true;
  }

  public pause(): void {
    this.state.isPlaying = false;
  }

  public update(): void {
    if (!this.state.isPlaying || this.state.winner) return;

    this.updateBall();
    this.checkCollisions();
    this.checkScore();
  }

  private updateBall(): void {
    this.state.ball.position.x += this.state.ball.velocity.x;
    this.state.ball.position.y += this.state.ball.velocity.y;
  }

  private checkCollisions(): void {
    if (this.state.orientation === 'vertical') {
      this.checkCollisionsVertical();
    } else {
      this.checkCollisionsHorizontal();
    }
  }

  private checkCollisionsHorizontal(): void {
    const { ball } = this.state;
    const { canvasHeight } = this.config;

    // Top and bottom wall collision
    if (ball.position.y - ball.radius <= 0 || ball.position.y + ball.radius >= canvasHeight) {
      ball.velocity.y *= -1;
      ball.position.y = ball.position.y - ball.radius <= 0
        ? ball.radius
        : canvasHeight - ball.radius;
    }

    // Paddle collision
    this.checkPaddleCollisionHorizontal(this.state.paddle1);
    this.checkPaddleCollisionHorizontal(this.state.paddle2);
  }

  private checkCollisionsVertical(): void {
    const { ball } = this.state;
    const { canvasWidth } = this.config;

    // Left and right wall collision
    if (ball.position.x - ball.radius <= 0 || ball.position.x + ball.radius >= canvasWidth) {
      ball.velocity.x *= -1;
      ball.position.x = ball.position.x - ball.radius <= 0
        ? ball.radius
        : canvasWidth - ball.radius;
    }

    // Paddle collision
    this.checkPaddleCollisionVertical(this.state.paddle1);
    this.checkPaddleCollisionVertical(this.state.paddle2);
  }

  private checkPaddleCollisionHorizontal(paddle: GameState['paddle1']): void {
    const { ball } = this.state;

    const ballLeft = ball.position.x - ball.radius;
    const ballRight = ball.position.x + ball.radius;
    const ballTop = ball.position.y - ball.radius;
    const ballBottom = ball.position.y + ball.radius;

    const paddleLeft = paddle.position.x;
    const paddleRight = paddle.position.x + paddle.size.width;
    const paddleTop = paddle.position.y;
    const paddleBottom = paddle.position.y + paddle.size.height;

    if (
      ballRight >= paddleLeft &&
      ballLeft <= paddleRight &&
      ballBottom >= paddleTop &&
      ballTop <= paddleBottom
    ) {
      const hitPos = (ball.position.y - (paddle.position.y + paddle.size.height / 2)) / (paddle.size.height / 2);
      ball.velocity.x *= -1.05;
      ball.velocity.y = hitPos * 8;

      if (ball.velocity.x > 0) {
        ball.position.x = paddleRight + ball.radius;
      } else {
        ball.position.x = paddleLeft - ball.radius;
      }
    }
  }

  private checkPaddleCollisionVertical(paddle: GameState['paddle1']): void {
    const { ball } = this.state;

    const ballLeft = ball.position.x - ball.radius;
    const ballRight = ball.position.x + ball.radius;
    const ballTop = ball.position.y - ball.radius;
    const ballBottom = ball.position.y + ball.radius;

    const paddleLeft = paddle.position.x;
    const paddleRight = paddle.position.x + paddle.size.width;
    const paddleTop = paddle.position.y;
    const paddleBottom = paddle.position.y + paddle.size.height;

    if (
      ballRight >= paddleLeft &&
      ballLeft <= paddleRight &&
      ballBottom >= paddleTop &&
      ballTop <= paddleBottom
    ) {
      const hitPos = (ball.position.x - (paddle.position.x + paddle.size.width / 2)) / (paddle.size.width / 2);
      ball.velocity.y *= -1.05;
      ball.velocity.x = hitPos * 8;

      if (ball.velocity.y > 0) {
        ball.position.y = paddleBottom + ball.radius;
      } else {
        ball.position.y = paddleTop - ball.radius;
      }
    }
  }

  private checkScore(): void {
    const { ball } = this.state;
    const { canvasWidth, canvasHeight, winningScore } = this.config;

    if (this.state.orientation === 'vertical') {
      // Vertical mode: ball goes off top or bottom
      if (ball.position.y + ball.radius < 0) {
        // Ball went off top - Player 1 scores
        this.state.score.player1++;
        this.resetBall();
      } else if (ball.position.y - ball.radius > canvasHeight) {
        // Ball went off bottom - Player 2 scores
        this.state.score.player2++;
        this.resetBall();
      }
    } else {
      // Horizontal mode: ball goes off left or right
      if (ball.position.x + ball.radius < 0) {
        // Ball went off left - Player 2 scores
        this.state.score.player2++;
        this.resetBall();
      } else if (ball.position.x - ball.radius > canvasWidth) {
        // Ball went off right - Player 1 scores
        this.state.score.player1++;
        this.resetBall();
      }
    }

    // Check for winner
    if (this.state.score.player1 >= winningScore) {
      this.state.winner = 'player1';
      this.state.isPlaying = false;
    } else if (this.state.score.player2 >= winningScore) {
      this.state.winner = 'player2';
      this.state.isPlaying = false;
    }
  }

  private resetBall(): void {
    const { canvasWidth, canvasHeight } = this.config;
    this.state.ball.position = { x: canvasWidth / 2, y: canvasHeight / 2 };

    if (this.state.orientation === 'vertical') {
      this.state.ball.velocity = {
        x: (Math.random() - 0.5) * 6,
        y: Math.random() > 0.5 ? 5 : -5,
      };
    } else {
      this.state.ball.velocity = {
        x: Math.random() > 0.5 ? 5 : -5,
        y: (Math.random() - 0.5) * 6,
      };
    }
  }

  // Move paddle in primary direction (up/down for horizontal, left/right for vertical)
  public movePaddle1Negative(): void {
    const paddle = this.state.paddle1;
    if (this.state.orientation === 'vertical') {
      // Move left
      paddle.position.x = Math.max(0, paddle.position.x - paddle.speed);
    } else {
      // Move up
      paddle.position.y = Math.max(0, paddle.position.y - paddle.speed);
    }
  }

  public movePaddle1Positive(): void {
    const paddle = this.state.paddle1;
    if (this.state.orientation === 'vertical') {
      // Move right
      const maxX = this.config.canvasWidth - paddle.size.width;
      paddle.position.x = Math.min(maxX, paddle.position.x + paddle.speed);
    } else {
      // Move down
      const maxY = this.config.canvasHeight - paddle.size.height;
      paddle.position.y = Math.min(maxY, paddle.position.y + paddle.speed);
    }
  }

  public movePaddle2Negative(): void {
    const paddle = this.state.paddle2;
    if (this.state.orientation === 'vertical') {
      // Move left
      paddle.position.x = Math.max(0, paddle.position.x - paddle.speed);
    } else {
      // Move up
      paddle.position.y = Math.max(0, paddle.position.y - paddle.speed);
    }
  }

  public movePaddle2Positive(): void {
    const paddle = this.state.paddle2;
    if (this.state.orientation === 'vertical') {
      // Move right
      const maxX = this.config.canvasWidth - paddle.size.width;
      paddle.position.x = Math.min(maxX, paddle.position.x + paddle.speed);
    } else {
      // Move down
      const maxY = this.config.canvasHeight - paddle.size.height;
      paddle.position.y = Math.min(maxY, paddle.position.y + paddle.speed);
    }
  }
}
