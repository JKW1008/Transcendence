import { createClient } from '@libsql/client';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const client = createClient({
  url: `file:${join(__dirname, 'dev.db')}`,
});

async function main() {
  console.log('🌱 Seeding database with SQLite...\n');

  // Clear existing data
  await client.execute('DELETE FROM Game');
  await client.execute('DELETE FROM User');
  console.log('✅ Cleared existing data');

  // Insert users
  const users = [
    { id: 'user-1', username: 'player1', email: 'player1@example.com', avatar: '🎮' },
    { id: 'user-2', username: 'player2', email: 'player2@example.com', avatar: '🎯' },
    { id: 'user-3', username: 'champion', email: 'champion@example.com', avatar: '🏆' },
    { id: 'user-4', username: 'rookie', email: 'rookie@example.com', avatar: '🌟' },
  ];

  for (const user of users) {
    await client.execute({
      sql: `INSERT INTO User (id, username, email, password, avatar, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      args: [user.id, user.username, user.email, 'password123', user.avatar],
    });
  }
  console.log(`✅ Created ${users.length} users`);

  // Insert games
  const games = [
    { id: 'game-1', player1Id: 'user-3', player2Id: 'user-1', score1: 5, score2: 2, winnerId: 'user-3' },
    { id: 'game-2', player1Id: 'user-3', player2Id: 'user-2', score1: 5, score2: 3, winnerId: 'user-3' },
    { id: 'game-3', player1Id: 'user-1', player2Id: 'user-2', score1: 5, score2: 4, winnerId: 'user-1' },
    { id: 'game-4', player1Id: 'user-2', player2Id: 'user-4', score1: 5, score2: 1, winnerId: 'user-2' },
    { id: 'game-5', player1Id: 'user-3', player2Id: 'user-4', score1: 5, score2: 0, winnerId: 'user-3' },
    { id: 'game-6', player1Id: 'user-1', player2Id: 'user-4', score1: 5, score2: 2, winnerId: 'user-1' },
  ];

  for (const game of games) {
    await client.execute({
      sql: `INSERT INTO Game (id, player1Id, player2Id, score1, score2, winnerId, status, createdAt, finishedAt, ballSpeed, paddleSize, winScore)
            VALUES (?, ?, ?, ?, ?, ?, 'finished', datetime('now'), datetime('now'), 5, 100, 5)`,
      args: [game.id, game.player1Id, game.player2Id, game.score1, game.score2, game.winnerId],
    });
  }
  console.log(`✅ Created ${games.length} games\n`);

  // Show results
  console.log('📊 Database Statistics:');
  const userStats = await client.execute(`
    SELECT
      u.username,
      u.avatar,
      COUNT(CASE WHEN g.winnerId = u.id THEN 1 END) as wins,
      COUNT(CASE WHEN (g.player1Id = u.id OR g.player2Id = u.id) AND g.winnerId != u.id AND g.winnerId IS NOT NULL THEN 1 END) as losses
    FROM User u
    LEFT JOIN Game g ON (g.player1Id = u.id OR g.player2Id = u.id) AND g.status = 'finished'
    GROUP BY u.id, u.username, u.avatar
    ORDER BY wins DESC
  `);

  for (const row of userStats.rows) {
    const wins = Number(row.wins);
    const losses = Number(row.losses);
    const total = wins + losses;
    const winRate = total > 0 ? ((wins / total) * 100).toFixed(1) : '0';
    console.log(`  ${row.avatar} ${row.username}: ${wins}W-${losses}L (${winRate}% win rate)`);
  }

  console.log('\n✨ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
