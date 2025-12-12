import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  // Clear existing data
  await prisma.game.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ Cleared existing data');

  // Create users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        id: 'user-1',
        username: 'player1',
        email: 'player1@example.com',
        password: 'password123',
        avatar: '🎮',
      },
    }),
    prisma.user.create({
      data: {
        id: 'user-2',
        username: 'player2',
        email: 'player2@example.com',
        password: 'password123',
        avatar: '🎯',
      },
    }),
    prisma.user.create({
      data: {
        id: 'user-3',
        username: 'champion',
        email: 'champion@example.com',
        password: 'password123',
        avatar: '🏆',
      },
    }),
    prisma.user.create({
      data: {
        id: 'user-4',
        username: 'rookie',
        email: 'rookie@example.com',
        password: 'password123',
        avatar: '🌟',
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users`);

  // Create games
  const games = await Promise.all([
    prisma.game.create({
      data: {
        id: 'game-1',
        player1Id: 'user-3',
        player2Id: 'user-1',
        score1: 5,
        score2: 2,
        winnerId: 'user-3',
        status: 'finished',
        finishedAt: new Date(),
        ballSpeed: 5,
        paddleSize: 100,
        winScore: 5,
      },
    }),
    prisma.game.create({
      data: {
        id: 'game-2',
        player1Id: 'user-3',
        player2Id: 'user-2',
        score1: 5,
        score2: 3,
        winnerId: 'user-3',
        status: 'finished',
        finishedAt: new Date(),
        ballSpeed: 6,
        paddleSize: 100,
        winScore: 5,
      },
    }),
    prisma.game.create({
      data: {
        id: 'game-3',
        player1Id: 'user-1',
        player2Id: 'user-2',
        score1: 5,
        score2: 4,
        winnerId: 'user-1',
        status: 'finished',
        finishedAt: new Date(),
        ballSpeed: 5,
        paddleSize: 100,
        winScore: 5,
      },
    }),
    prisma.game.create({
      data: {
        id: 'game-4',
        player1Id: 'user-2',
        player2Id: 'user-4',
        score1: 5,
        score2: 1,
        winnerId: 'user-2',
        status: 'finished',
        finishedAt: new Date(),
        ballSpeed: 5,
        paddleSize: 100,
        winScore: 5,
      },
    }),
    prisma.game.create({
      data: {
        id: 'game-5',
        player1Id: 'user-3',
        player2Id: 'user-4',
        score1: 5,
        score2: 0,
        winnerId: 'user-3',
        status: 'finished',
        finishedAt: new Date(),
        ballSpeed: 7,
        paddleSize: 100,
        winScore: 5,
      },
    }),
    prisma.game.create({
      data: {
        id: 'game-6',
        player1Id: 'user-1',
        player2Id: 'user-4',
        score1: 5,
        score2: 2,
        winnerId: 'user-1',
        status: 'finished',
        finishedAt: new Date(),
        ballSpeed: 5,
        paddleSize: 100,
        winScore: 5,
      },
    }),
  ]);

  console.log(`✅ Created ${games.length} games\n`);

  console.log('📊 Database Statistics:');
  console.log('  🏆 champion: 3W-0L (100.0% win rate)');
  console.log('  🎮 player1: 2W-1L (66.7% win rate)');
  console.log('  🎯 player2: 1W-2L (33.3% win rate)');
  console.log('  🌟 rookie: 0W-3L (0.0% win rate)');

  console.log('\n✨ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
