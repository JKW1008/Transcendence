import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = `file:${join(__dirname, 'dev.db')}`;
console.log('Database path:', dbPath);

const libsql = createClient({
  url: dbPath,
});

const adapter = new PrismaLibSql(libsql);
const prisma = new PrismaClient({ adapter });

console.log('Prisma client created successfully');

async function main() {
  console.log('🌱 Seeding database...');

  // 기존 데이터 삭제
  await prisma.game.deleteMany();
  await prisma.user.deleteMany();

  // 테스트 유저 생성
  const users = await Promise.all([
    prisma.user.create({
      data: {
        username: 'player1',
        email: 'player1@example.com',
        password: 'password123', // 실제로는 해시해야 함
        avatar: '🎮',
      },
    }),
    prisma.user.create({
      data: {
        username: 'player2',
        email: 'player2@example.com',
        password: 'password123',
        avatar: '🎯',
      },
    }),
    prisma.user.create({
      data: {
        username: 'champion',
        email: 'champion@example.com',
        password: 'password123',
        avatar: '🏆',
      },
    }),
    prisma.user.create({
      data: {
        username: 'rookie',
        email: 'rookie@example.com',
        password: 'password123',
        avatar: '🌟',
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users`);

  // 테스트 게임 데이터 생성
  const games = [];

  // Champion vs Player1 - Champion wins
  games.push(
    await prisma.game.create({
      data: {
        player1Id: users[2].id, // champion
        player2Id: users[0].id, // player1
        score1: 5,
        score2: 2,
        winnerId: users[2].id,
        status: 'finished',
        finishedAt: new Date('2024-12-10T10:00:00Z'),
        ballSpeed: 5,
        paddleSize: 100,
        winScore: 5,
      },
    })
  );

  // Champion vs Player2 - Champion wins
  games.push(
    await prisma.game.create({
      data: {
        player1Id: users[2].id, // champion
        player2Id: users[1].id, // player2
        score1: 5,
        score2: 3,
        winnerId: users[2].id,
        status: 'finished',
        finishedAt: new Date('2024-12-10T11:00:00Z'),
        ballSpeed: 6,
        paddleSize: 100,
        winScore: 5,
      },
    })
  );

  // Player1 vs Player2 - Player1 wins
  games.push(
    await prisma.game.create({
      data: {
        player1Id: users[0].id, // player1
        player2Id: users[1].id, // player2
        score1: 5,
        score2: 4,
        winnerId: users[0].id,
        status: 'finished',
        finishedAt: new Date('2024-12-10T12:00:00Z'),
        ballSpeed: 5,
        paddleSize: 100,
        winScore: 5,
      },
    })
  );

  // Player2 vs Rookie - Player2 wins
  games.push(
    await prisma.game.create({
      data: {
        player1Id: users[1].id, // player2
        player2Id: users[3].id, // rookie
        score1: 5,
        score2: 1,
        winnerId: users[1].id,
        status: 'finished',
        finishedAt: new Date('2024-12-10T13:00:00Z'),
        ballSpeed: 5,
        paddleSize: 100,
        winScore: 5,
      },
    })
  );

  // Champion vs Rookie - Champion wins
  games.push(
    await prisma.game.create({
      data: {
        player1Id: users[2].id, // champion
        player2Id: users[3].id, // rookie
        score1: 5,
        score2: 0,
        winnerId: users[2].id,
        status: 'finished',
        finishedAt: new Date('2024-12-10T14:00:00Z'),
        ballSpeed: 7,
        paddleSize: 100,
        winScore: 5,
      },
    })
  );

  // Player1 vs Rookie - Player1 wins
  games.push(
    await prisma.game.create({
      data: {
        player1Id: users[0].id, // player1
        player2Id: users[3].id, // rookie
        score1: 5,
        score2: 2,
        winnerId: users[0].id,
        status: 'finished',
        finishedAt: new Date('2024-12-11T09:00:00Z'),
        ballSpeed: 5,
        paddleSize: 100,
        winScore: 5,
      },
    })
  );

  console.log(`✅ Created ${games.length} games`);

  // 통계 출력
  console.log('\n📊 User Statistics:');
  for (const user of users) {
    const wins = await prisma.game.count({
      where: { winnerId: user.id, status: 'finished' },
    });
    const totalGames = await prisma.game.count({
      where: {
        OR: [{ player1Id: user.id }, { player2Id: user.id }],
        status: 'finished',
      },
    });
    const losses = totalGames - wins;
    const winRate = totalGames > 0 ? ((wins / totalGames) * 100).toFixed(1) : '0';

    console.log(`  ${user.avatar} ${user.username}: ${wins}W-${losses}L (${winRate}% win rate)`);
  }

  console.log('\n✨ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
