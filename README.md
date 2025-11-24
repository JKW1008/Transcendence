# 🎮 Pong Game

Classic Pong game built with React, TypeScript, and Tailwind CSS.

## Features

- ✨ Classic Pong gameplay
- 🎨 Modern UI with Tailwind CSS
- ⚡ Built with React 18 + TypeScript
- 🎮 Two-player local multiplayer
- 🏆 Score tracking and win conditions
- 🐳 Docker support

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **Docker** - Containerization

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Development

1. Install dependencies:
```bash
npm install
```

2. Run development server:
```bash
npm run dev
```

3. Open http://localhost:3000

### Docker

Build and run with Docker:

```bash
docker-compose up --build
```

Or manually:

```bash
docker build -t pong-game .
docker run -p 3000:80 pong-game
```

## How to Play

### Controls

**Player 1 (Left)**
- `W` - Move up
- `S` - Move down

**Player 2 (Right)**
- `↑` - Move up
- `↓` - Move down

### Rules

- First player to reach 5 points wins
- Ball bounces off paddles and walls
- Miss the ball and your opponent scores!

## Project Structure

```
src/
├── components/
│   └── Game/
│       ├── Game.tsx           # Main game component
│       └── GameCanvas.tsx     # Canvas rendering
├── game/
│   └── GameEngine.ts          # Core game logic
├── hooks/
│   ├── useGameLoop.ts         # Game loop hook
│   └── useKeyboard.ts         # Keyboard input hook
├── types/
│   └── index.ts               # TypeScript types
├── App.tsx
├── main.tsx
└── index.css
```

## License

MIT
