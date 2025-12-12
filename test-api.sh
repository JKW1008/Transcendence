#!/bin/bash

echo "🧪 Testing Pong Game APIs"
echo "============================"
echo

# API Base URL
BASE_URL="http://localhost:3000/api"

echo "📝 Step 1: Testing Leaderboard (should be empty initially)"
echo "GET $BASE_URL/leaderboard"
curl -s "$BASE_URL/leaderboard" | jq '.'
echo
echo

echo "📝 Step 2: Testing Games List (should be empty initially)"
echo "GET $BASE_URL/games"
curl -s "$BASE_URL/games" | jq '.'
echo
echo

echo "🎮 Note: To create test data, you need to:"
echo "1. Create users first (requires User Management API - not yet implemented)"
echo "2. Or manually insert users into the database"
echo
echo "For now, let's show the API structure by testing with mock IDs:"
echo

echo "📝 Step 3: Testing Create Game endpoint (will fail without users, but shows structure)"
echo "POST $BASE_URL/games"
curl -s -X POST "$BASE_URL/games" \
  -H "Content-Type: application/json" \
  -d '{
    "player1Id": "test-user-1",
    "player2Id": "test-user-2",
    "score1": 5,
    "score2": 3,
    "winnerId": "test-user-1",
    "ballSpeed": 5,
    "paddleSize": 100,
    "winScore": 5
  }' | jq '.'
echo
echo

echo "✅ API Testing Complete!"
echo
echo "📋 Available Endpoints:"
echo "  GET  $BASE_URL/games           - List all games"
echo "  GET  $BASE_URL/games/:id       - Get specific game"
echo "  POST $BASE_URL/games           - Create new game"
echo "  GET  $BASE_URL/leaderboard     - Get leaderboard"
echo "  GET  $BASE_URL/leaderboard/:id - Get user rank"
