import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer as createHttpServer } from 'node:http';
import express from 'express';
import session from 'express-session';
import ConnectSqlite3 from 'connect-sqlite3';
import { Server as SocketIOServer } from 'socket.io';
import GameManager from './src/socket/gameHandler.js';
import TournamentManager from './src/socket/tournamentHandler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === 'production';
const port = process.env.PORT || 3000;

const SQLiteStore = ConnectSqlite3(session);

async function createServer() {
  const app = express();

  // JSON body parser for API routes
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Session configuration
  app.use(
    session({
      store: new SQLiteStore({
        db: 'sessions.db',
        dir: './data',
      }),
      secret: process.env.SESSION_SECRET || 'pong-game-secret-key-change-in-production',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: isProduction, // HTTPS only in production
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      },
    })
  );

  // API routes - must be before SSR middleware
  const authRouter = (await import('./src/api/routes/auth.js')).default;
  const usersRouter = (await import('./src/api/routes/users.js')).default;
  const gamesRouter = (await import('./src/api/routes/games.js')).default;
  const leaderboardRouter = (await import('./src/api/routes/leaderboard.js')).default;
  const friendsRouter = (await import('./src/api/routes/friends.js')).default;

  app.use('/api/auth', authRouter);
  app.use('/api/users', usersRouter);
  app.use('/api/games', gamesRouter);
  app.use('/api/leaderboard', leaderboardRouter);
  app.use('/api/friends', friendsRouter);

  let vite;
  if (!isProduction) {
    // Development mode: use Vite's dev server as middleware
    const { createServer } = await import('vite');
    vite = await createServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: serve static files
    const compression = (await import('compression')).default;
    const sirv = (await import('sirv')).default;
    app.use(compression());
    app.use(sirv(path.join(__dirname, 'dist/client'), { extensions: [] }));
  }

  app.use(async (req, res, next) => {
    const url = req.originalUrl;

    try {
      let template;
      let render;

      if (!isProduction) {
        // Development: read and transform template on the fly
        template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        render = (await vite.ssrLoadModule('/src/entry-server.tsx')).render;
      } else {
        // Production: use pre-built files
        template = fs.readFileSync(
          path.resolve(__dirname, 'dist/client/index.html'),
          'utf-8'
        );
        render = (await import('./dist/server/entry-server.js')).render;
      }

      const { html: appHtml } = render(url);
      const html = template.replace('<!--ssr-outlet-->', appHtml);

      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (e) {
      if (!isProduction && vite) {
        vite.ssrFixStacktrace(e);
      }
      console.error(e);
      next(e);
    }
  });

  // Create HTTP server
  const httpServer = createHttpServer(app);

  // Setup Socket.IO
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: isProduction ? false : '*',
      methods: ['GET', 'POST'],
    },
  });

  // Initialize managers
  const gameManager = new GameManager(io);
  const tournamentManager = new TournamentManager(io, gameManager);
  gameManager.setTournamentManager(tournamentManager);

  // Socket.IO connection handling
  io.on('connection', (socket) => {
    console.log(`🎮 Player connected: ${socket.id}`);

    // ===== Matchmaking =====
    socket.on('queue:join', (userData) => {
      console.log(`👤 ${userData.username} joined queue`);
      gameManager.addPlayerToQueue(socket, userData);
    });

    socket.on('queue:leave', () => {
      gameManager.handleDisconnect(socket);
    });

    // ===== Tournament =====
    socket.on('tournament:create', (data) => {
      const minPlayers = data?.minPlayers || 4;
      const result = tournamentManager.createTournament(minPlayers);
      socket.emit('tournament:created', result);
    });

    socket.on('tournament:join', (data) => {
      const { tournamentId, userData } = data;
      console.log(`🏆 ${userData.username} joining tournament ${tournamentId}`);
      const result = tournamentManager.joinTournament(socket, userData, tournamentId);
      socket.emit('tournament:join-result', result);
    });

    socket.on('tournament:leave', () => {
      const result = tournamentManager.leaveTournament(socket);
      socket.emit('tournament:leave-result', result);
    });

    socket.on('tournament:list', () => {
      const tournaments = tournamentManager.getAvailableTournaments();
      socket.emit('tournament:list-result', tournaments);
    });

    // ===== Game Controls =====
    socket.on('paddle:keydown', (data) => {
      gameManager.handleKeyState(socket, data.direction, true);
    });

    socket.on('paddle:keyup', (data) => {
      gameManager.handleKeyState(socket, data.direction, false);
    });

    // Legacy paddle movement (kept for compatibility)
    socket.on('paddle:move', (data) => {
      gameManager.handlePaddleMove(socket, data.direction);
    });

    // ===== Disconnect =====
    socket.on('disconnect', () => {
      console.log(`👋 Player disconnected: ${socket.id}`);
      gameManager.handleDisconnect(socket);
      tournamentManager.handleDisconnect(socket);
    });
  });

  httpServer.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
    console.log(`🎮 WebSocket server ready for online multiplayer`);
    console.log(`📡 Server accessible from external computers at http://<your-ip>:${port}`);
  });
}

createServer();
