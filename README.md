# 🎮 Pong Game

Classic Pong game built with React, TypeScript, and Tailwind CSS.

## Features

- ✨ Classic Pong gameplay
- 🎨 Modern UI with Tailwind CSS
- ⚡ Built with React 18 + TypeScript
- 🎮 Two-player local multiplayer
- 🏆 Score tracking and win conditions
- 🐳 Docker support
- 💾 Database with Prisma ORM
- 🖥️ Server-Side Rendering (SSR)
- 🌐 Cross-browser compatibility

## Tech Stack

**Frontend:**
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Vite** - Build tool

**Backend:**
- **Express** - Web framework
- **Prisma** - ORM for database
- **SQLite** - Database

**DevOps:**
- **Docker** - Containerization
- **SSR** - Server-Side Rendering

## Browser Compatibility

This application is tested and fully compatible with the following browsers:

| Browser | Version | Status |
|---------|---------|--------|
| Google Chrome | Latest (stable) | ✅ Fully Supported (Primary) |
| Mozilla Firefox | Latest (stable) | ✅ Fully Supported |
| Safari | Latest (stable) | ✅ Fully Supported |
| Microsoft Edge | Latest (stable) | ✅ Compatible |

**Tested Features:**
- ✅ Canvas rendering (HTML5 Canvas API)
- ✅ Keyboard input handling
- ✅ Responsive design (mobile & desktop)
- ✅ CSS Grid & Flexbox layout
- ✅ Tailwind CSS utilities
- ✅ React 18 features (Suspense, concurrent rendering)

**Minimum Requirements:**
- ES2020+ support
- HTML5 Canvas support
- CSS3 support
- JavaScript enabled

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
