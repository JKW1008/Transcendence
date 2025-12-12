-- Clear existing data
DELETE FROM Game;
DELETE FROM User;

-- Insert test users
INSERT INTO User (id, username, email, password, avatar, createdAt, updatedAt) VALUES
('user-1', 'player1', 'player1@example.com', 'password123', '🎮', datetime('now'), datetime('now')),
('user-2', 'player2', 'player2@example.com', 'password123', '🎯', datetime('now'), datetime('now')),
('user-3', 'champion', 'champion@example.com', 'password123', '🏆', datetime('now'), datetime('now')),
('user-4', 'rookie', 'rookie@example.com', 'password123', '🌟', datetime('now'), datetime('now'));

-- Insert test games
-- Champion wins against Player1
INSERT INTO Game (id, player1Id, player2Id, score1, score2, winnerId, status, createdAt, finishedAt, ballSpeed, paddleSize, winScore) VALUES
('game-1', 'user-3', 'user-1', 5, 2, 'user-3', 'finished', datetime('now', '-2 hours'), datetime('now', '-2 hours'), 5, 100, 5);

-- Champion wins against Player2
INSERT INTO Game (id, player1Id, player2Id, score1, score2, winnerId, status, createdAt, finishedAt, ballSpeed, paddleSize, winScore) VALUES
('game-2', 'user-3', 'user-2', 5, 3, 'user-3', 'finished', datetime('now', '-1 hour'), datetime('now', '-1 hour'), 6, 100, 5);

-- Player1 wins against Player2
INSERT INTO Game (id, player1Id, player2Id, score1, score2, winnerId, status, createdAt, finishedAt, ballSpeed, paddleSize, winScore) VALUES
('game-3', 'user-1', 'user-2', 5, 4, 'user-1', 'finished', datetime('now', '-30 minutes'), datetime('now', '-30 minutes'), 5, 100, 5);

-- Player2 wins against Rookie
INSERT INTO Game (id, player1Id, player2Id, score1, score2, winnerId, status, createdAt, finishedAt, ballSpeed, paddleSize, winScore) VALUES
('game-4', 'user-2', 'user-4', 5, 1, 'user-2', 'finished', datetime('now', '-20 minutes'), datetime('now', '-20 minutes'), 5, 100, 5);

-- Champion wins against Rookie
INSERT INTO Game (id, player1Id, player2Id, score1, score2, winnerId, status, createdAt, finishedAt, ballSpeed, paddleSize, winScore) VALUES
('game-5', 'user-3', 'user-4', 5, 0, 'user-3', 'finished', datetime('now', '-10 minutes'), datetime('now', '-10 minutes'), 7, 100, 5);

-- Player1 wins against Rookie
INSERT INTO Game (id, player1Id, player2Id, score1, score2, winnerId, status, createdAt, finishedAt, ballSpeed, paddleSize, winScore) VALUES
('game-6', 'user-1', 'user-4', 5, 2, 'user-1', 'finished', datetime('now'), datetime('now'), 5, 100, 5);

-- Display results
SELECT 'Users created:' as message;
SELECT username, email, avatar FROM User;

SELECT '' as '';
SELECT 'Games created:' as message;
SELECT
    (SELECT username FROM User WHERE id = Game.player1Id) as player1,
    score1,
    score2,
    (SELECT username FROM User WHERE id = Game.player2Id) as player2,
    (SELECT username FROM User WHERE id = Game.winnerId) as winner
FROM Game;
